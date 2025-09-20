/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenerativeAI } from "@google/generative-ai"
import { TextProcessor } from "./text-processor"

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyDDL1SeXvWjjcYcVWLA5dFlvN8U61_ZtpE")

export interface PlagiarismMatch {
  originalText: string
  matchedText: string
  similarity: number
  startIndex: number
  endIndex: number
  sourceDocument: string
}

export interface PlagiarismResult {
  overallSimilarity: number
  matches: PlagiarismMatch[]
  summary: string
  recommendations: string[]
}

export class GeminiPlagiarismDetector {
  private model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })



  private createPlagiarismPrompt(documents: { name: string; content: string }[]): string {
    const docTexts = documents.map((doc, index) => `DOCUMENTO ${index + 1} (${doc.name}):\n${doc.content}\n\n`).join("")

    return `
Analiza los siguientes documentos para detectar plagio y similitudes. Proporciona un análisis detallado en formato JSON:

${docTexts}

Responde ÚNICAMENTE con un JSON válido con esta estructura:
{
  "overallSimilarity": número entre 0 y 100,
  "matches": [
    {
      "originalText": "texto original encontrado",
      "matchedText": "texto similar encontrado",
      "similarity": número entre 0 y 100,
      "startIndex": índice de inicio en el texto,
      "endIndex": índice de fin en el texto,
      "sourceDocument": "nombre del documento fuente"
    }
  ],
  "summary": "resumen del análisis de plagio",
  "recommendations": ["recomendación 1", "recomendación 2"]
}

Instrucciones específicas:
1. Identifica fragmentos de texto similares de al menos 10 palabras
2. Calcula porcentajes de similitud precisos
3. Incluye el índice exacto donde aparece cada coincidencia
4. Proporciona recomendaciones académicas
5. Considera paráfrasis y reformulaciones como similitudes
`
  }

  private parsePlagiarismResponse(response: string, documents: { name: string; content: string }[]): PlagiarismResult {
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("No JSON found in response")
      }

      const parsed = JSON.parse(jsonMatch[0])

      // Validate and sanitize the response
      return {
        overallSimilarity: Math.min(100, Math.max(0, parsed.overallSimilarity || 0)),
        matches: (parsed.matches || []).map((match: any) => ({
          originalText: match.originalText || "",
          matchedText: match.matchedText || "",
          similarity: Math.min(100, Math.max(0, match.similarity || 0)),
          startIndex: Math.max(0, match.startIndex || 0),
          endIndex: Math.max(0, match.endIndex || 0),
          sourceDocument: match.sourceDocument || "Desconocido",
        })),
        summary: parsed.summary || "Análisis completado",
        recommendations: parsed.recommendations || [],
      }
    } catch (error) {
      console.error("Error parsing Gemini response:", error)
      return this.fallbackAnalysis(documents)
    }
  }

  private fallbackAnalysis(documents: { name: string; content: string }[]): PlagiarismResult {
    // Simple fallback analysis when AI fails
    const doc1 = documents[0].content.toLowerCase()
    const doc2 = documents[1].content.toLowerCase()

    const words1 = doc1.split(/\s+/)
    const words2 = doc2.split(/\s+/)

    let matches = 0
    const totalWords = Math.max(words1.length, words2.length)

    // Simple word overlap calculation
    const commonWords = words1.filter((word) => words2.includes(word))
    matches = commonWords.length

    const similarity = Math.round((matches / totalWords) * 100)

    return {
      overallSimilarity: similarity,
      matches: [
        {
          originalText: commonWords.slice(0, 10).join(" "),
          matchedText: commonWords.slice(0, 10).join(" "),
          similarity: similarity,
          startIndex: 0,
          endIndex: commonWords.slice(0, 10).join(" ").length,
          sourceDocument: documents[1].name,
        },
      ],
      summary: `Análisis básico completado. Similitud detectada: ${similarity}%`,
      recommendations: [
        "Revisa las coincidencias encontradas",
        "Considera citar las fuentes apropiadamente",
        "Parafrasea el contenido similar",
      ],
    }
  }

  async generateCitations(text: string, style: "APA" | "IEEE" | "MLA"): Promise<string[]> {
    const prompt = `
Analiza el siguiente texto y genera las citas bibliográficas en formato ${style} para todas las fuentes que deberían ser citadas:

${text}

Responde con una lista de citas en formato ${style}, una por línea.
Si no encuentras fuentes específicas, proporciona ejemplos de cómo deberían citarse los tipos de contenido encontrados.
`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const citations = response
        .text()
        .split("\n")
        .filter((line) => line.trim())
      return citations
    } catch (error) {
      console.error("Error generating citations:", error)
      return [`Error generando citas en formato ${style}. Verifica tu conexión.`]
    }
  }

  async generateMindMap(text: string): Promise<any> {
    const prompt = `
Analiza el siguiente texto y crea un mapa mental en formato JSON con las ideas principales y secundarias:

${text}

Responde ÚNICAMENTE con un JSON válido con esta estructura:
{
  "title": "Título principal del texto",
  "mainIdeas": [
    {
      "title": "Idea principal 1",
      "subIdeas": ["Sub-idea 1.1", "Sub-idea 1.2"],
      "color": "blue"
    }
  ]
}
`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      throw new Error("No JSON found")
    } catch (error) {
      console.error("Error generating mind map:", error)
      return {
        title: "Error generando mapa mental",
        mainIdeas: [
          {
            title: "Verifica tu conexión",
            subIdeas: ["Intenta nuevamente"],
            color: "red",
          },
        ],
      }
    }
  }

  async summarizeText(text: string): Promise<string> {
    const prompt = `
Crea un resumen académico profesional del siguiente texto. 
El resumen debe ser conciso, formal y mantener las ideas principales:

${text}

Responde con un resumen de máximo 200 palabras en estilo académico.
`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error("Error summarizing text:", error)
      return "Error generando resumen. Verifica tu conexión a internet."
    }
  }

  async generatePresentation(text: string): Promise<any> {
    const prompt = `
ANALIZA el siguiente texto y conviértelo en una presentación profesional con diapositivas bien estructuradas.

TEXTO A ANALIZAR:
${text}

GENERA un JSON con la siguiente estructura:
{
  "title": "Título principal atractivo",
  "slides": [
    {
      "title": "Título claro y conciso",
      "content": ["Punto 1", "Punto 2", "Punto 3"],
      "type": "title|content|image|quote|code|summary|questions",
      "imagePrompt": "Descripción para generar imagen relacionada (solo para type: image)",
      "speakerNotes": "Notas para el presentador"
    }
  ]
}

INSTRUCCIONES ESPECÍFICAS:
1. Crea entre 5-12 diapositivas según la complejidad del texto
2. La primera diapositiva debe ser de tipo "title" (portada)
3. La última diapositiva debe ser de tipo "summary" o "questions"
4. Incluye 1-2 diapositivas de tipo "image" con imagePrompt descriptivo
5. Para diapositivas técnicas, usa type: "code" cuando sea apropiado
6. Distribuye balancedamente los contenidos
7. Los puntos en content deben ser breves (máximo 15 palabras)
8. speakerNotes debe contener tips para explicar cada diapositiva

EJEMPLO DE imagePrompt: "Profesionales colaborando en oficina moderna con gráficos digitales"

Responde EXCLUSIVAMENTE con el JSON válido, sin texto adicional.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
      
        // Validar y enriquecer la estructura para Spectacle
        return this.validatePresentationStructure(parsedData);
      }
      throw new Error("No JSON found in response");
    } catch (error) {
      console.error("Error generating presentation:", error);
      return this.getFallbackPresentation();
    }
  }

  private validatePresentationStructure(data: any): any {
    // Asegurar que tenga la estructura mínima requerida
    const defaultPresentation = {
      title: "Presentación Generada",
      slides: []
    };

    if (!data || typeof data !== 'object') {
      return defaultPresentation;
    }

    const validatedData = {
      title: data.title || "Presentación Generada",
      slides: Array.isArray(data.slides) ? data.slides.map((slide: any, index: number) => ({
        title: slide.title || `Diapositiva ${index + 1}`,
        content: Array.isArray(slide.content) ? slide.content : ["Contenido no disponible"],
        type: this.validateSlideType(slide.type),
        imagePrompt: slide.imagePrompt || "",
        speakerNotes: slide.speakerNotes || ""
      })) : []
    };

    // Asegurar al menos 3 diapositivas
    if (validatedData.slides.length < 3) {
      validatedData.slides = [
        {
          title: validatedData.title,
          content: ["Presentación generada automáticamente"],
          type: "title",
          imagePrompt: "Portada de presentación profesional con título",
          speakerNotes: "Bienvenida y presentación del tema"
        },
        ...validatedData.slides,
        {
          title: "Conclusiones",
          content: ["Resumen de puntos clave", "Próximos pasos"],
          type: "summary",
          imagePrompt: "Profesionales discutiendo conclusiones",
          speakerNotes: "Recapitular y cerrar con impacto"
        }
      ];
    }

    return validatedData;
  }

  private validateSlideType(type: string): string {
    const validTypes = ["title", "content", "image", "quote", "code", "summary", "questions"];
    return validTypes.includes(type) ? type : "content";
  }

  private getFallbackPresentation(): any {
    return {
      title: "Presentación de Ejemplo",
      slides: [
        {
          title: "Bienvenida",
          content: ["Presentación generada por IA", "Tema personalizado según tu texto"],
          type: "title",
          imagePrompt: "Auditorio con profesionales atendiendo presentación",
          speakerNotes: "Saludo inicial y presentación del objetivo"
        },
        {
          title: "Introducción",
          content: ["Contexto del tema", "Importancia y relevancia", "Objetivos principales"],
          type: "content",
          imagePrompt: "Introducción conceptual con gráficos",
          speakerNotes: "Establecer el contexto y por qué es importante"
        },
        {
          title: "Desarrollo",
          content: ["Punto clave 1", "Punto clave 2", "Punto clave 3"],
          type: "content",
          imagePrompt: "Desarrollo de ideas con diagramas",
          speakerNotes: "Profundizar en cada punto con ejemplos"
        },
        {
          title: "Ejemplo Visual",
          content: ["Visualización de conceptos", "Gràficos explicativos"],
          type: "image",
          imagePrompt: "Infografía profesional con datos y gráficos",
          speakerNotes: "Explicar el visual y su relación con el tema"
        },
        {
          title: "Conclusiones",
          content: ["Resumen de puntos principales", "Recomendaciones", "Próximos pasos"],
          type: "summary",
          imagePrompt: "Profesionales discutiendo conclusiones",
          speakerNotes: "Sintetizar y dejar mensaje clave"
        }
      ]
    };
  }

// Dentro de la clase GeminiPlagiarismDetector, modifica el método analyzePlagiarism:
async analyzePlagiarism(documents: { name: string; content: string }[]): Promise<PlagiarismResult> {
  if (documents.length < 2) {
    throw new Error("Se necesitan al menos 2 documentos para comparar");
  }

  // Análisis local primero para coincidencias exactas
  const exactMatches = TextProcessor.findExactMatches(
    documents[0].content, 
    documents[1].content,
    documents[1].name
  );
  
  // Análisis con IA para coincidencias más complejas
  let aiResult: PlagiarismResult;
  try {
    const prompt = this.createEnhancedPlagiarismPrompt(documents);
    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    aiResult = this.parsePlagiarismResponse(text, documents);
  } catch (error) {
    console.error("Error analyzing plagiarism with Gemini:", error);
    aiResult = this.fallbackAnalysis(documents);
  }
  
  // Combinar resultados (eliminar duplicados)
  const combinedMatches = [...exactMatches, ...aiResult.matches].filter(
    (match, index, self) => 
      index === self.findIndex(m => 
        m.startIndex === match.startIndex && 
        m.endIndex === match.endIndex
      )
  );
  
  // Calcular similitud general mejorada
  const overallSimilarity = this.calculateOverallSimilarity(combinedMatches, documents);
  
  return {
    overallSimilarity,
    matches: combinedMatches,
    summary: aiResult.summary,
    recommendations: aiResult.recommendations
  };
}

// Añade este nuevo método después de analyzePlagiarism:
private createEnhancedPlagiarismPrompt(documents: { name: string; content: string }[]): string {
  return `
ANALIZA meticulosamente los siguientes documentos para detectar plagio, paráfrasis y similitudes textuales.

DOCUMENTOS A COMPARAR:
${documents.map((doc, index) => `DOCUMENTO ${index + 1} (${doc.name}):\n${doc.content.substring(0, 10000)}\n`).join("\n")}

INSTRUCCIONES ESPECÍFICAS:
1. Identifica TODOS los fragmentos similares (mínimo 5 palabras consecutivas)
2. Clasifica por tipo: 
   - "EXACTO" (texto idéntico, 100% similitud)
   - "PARAFRASIS" (mismo significado, palabras diferentes, 70-99% similitud)
   - "SIMILAR" (ideas similares, 40-69% similitud)
3. Para cada coincidencia, proporciona:
   - Texto original EXACTO con 10 palabras de contexto antes/después
   - Texto coincidente EXACTO
   - Porcentaje de similitud preciso
   - Posiciones exactas (índices de caracteres)
   - Tipo de similitud (exacta/parafrasis/similar)

RESPONDER EXCLUSIVAMENTE con JSON válido:

{
  "overallSimilarity": número,
  "matches": [{
    "originalText": "texto completo con contexto",
    "matchedText": "texto coincidente con contexto", 
    "similarity": número,
    "startIndex": número,
    "endIndex": número,
    "sourceDocument": "nombre documento",
    "type": "EXACTO|PARAFRASIS|SIMILAR"
  }],
  "summary": "resumen detallado en español",
  "recommendations": ["array", "de", "recomendaciones"]
}
`;
}

// Añade este método para calcular similitud general
private calculateOverallSimilarity(matches: PlagiarismMatch[], documents: { name: string; content: string }[]): number {
  if (matches.length === 0) return 0;
  
  const totalChars = documents.reduce((sum, doc) => sum + doc.content.length, 0);
  const matchedChars = matches.reduce((sum, match) => sum + (match.endIndex - match.startIndex), 0);
  
  return Math.min(100, Math.round((matchedChars / totalChars) * 100 * 2)); // ×2 porque son 2 documentos
}

  
}




export const geminiDetector = new GeminiPlagiarismDetector()
