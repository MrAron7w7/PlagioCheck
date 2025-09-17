export interface PlagiarismMatch {
  text: string
  startA: number
  endA: number
  startB: number
  endB: number
  similarity: number
  color: string // Added color for highlighting matches
}

export interface PlagiarismResult {
  id: string
  documentA: string
  documentB: string
  similarity: number
  matches: PlagiarismMatch[]
  totalMatches: number
  date: string
  status: "completed" | "processing" | "error"
  textA: string // Store original texts for PDF generation
  textB: string
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // For demo purposes, we'll use a more sophisticated mock that simulates real extraction
    const arrayBuffer = await file.arrayBuffer()

    // Simulate processing time based on file size
    const processingTime = Math.min(3000, Math.max(1000, arrayBuffer.byteLength / 1000))

    return new Promise((resolve) => {
      setTimeout(() => {
        // Enhanced mock texts with more realistic content
        const mockTexts: Record<string, string> = {
          "ensayo_historia_medieval.pdf": `
La Edad Media, también conocida como el Medioevo, fue un período histórico que abarcó desde el siglo V hasta el siglo XV. Durante este tiempo, Europa experimentó profundos cambios sociales, políticos y culturales que transformaron completamente la estructura de la sociedad occidental.

El feudalismo se convirtió en el sistema dominante, caracterizado por la descentralización del poder político y la organización jerárquica de la sociedad. Los señores feudales controlaban vastas extensiones de tierra y tenían autoridad absoluta sobre los campesinos que trabajaban sus tierras. Este sistema creó una red compleja de obligaciones mutuas entre diferentes niveles sociales.

La Iglesia Católica desempeñó un papel fundamental en la sociedad medieval, no solo como institución religiosa sino también como poder político y económico. Los monasterios se convirtieron en centros de aprendizaje y preservación del conocimiento clásico durante los siglos más oscuros del período.

Las cruzadas fueron expediciones militares organizadas por la cristiandad occidental con el objetivo de recuperar Tierra Santa del control musulmán. Estas campañas tuvieron profundas consecuencias económicas, sociales y culturales, facilitando el intercambio comercial y cultural entre Oriente y Occidente.

El arte gótico floreció durante los siglos XII y XIII, caracterizado por sus catedrales imponentes que se alzaban hacia el cielo como símbolos de la fe cristiana. La arquitectura gótica representó una revolución técnica y estética que influyó en el desarrollo artístico posterior.

La literatura medieval incluía obras épicas como el Cantar de Mío Cid y los romances cortesanos que narraban las aventuras de caballeros y damas. Estas obras reflejaban los valores y ideales de la sociedad feudal, especialmente el código de honor caballeresco.

El comercio comenzó a revitalizarse hacia el final del período medieval, especialmente con el desarrollo de las ciudades comerciales italianas y el establecimiento de rutas comerciales que conectaban Europa con Asia y África.

Las universidades medievales, como las de Bolonia, París y Oxford, sentaron las bases de la educación superior moderna y contribuyeron al renacimiento intelectual que caracterizó los últimos siglos del período medieval.
          `,
          "trabajo_edad_media.pdf": `
El período medieval, conocido como Edad Media, se extendió desde el siglo V hasta el XV, marcando una era de transformaciones profundas en Europa. Durante esta época, el continente europeo vivió cambios significativos en los aspectos sociales, políticos y culturales que redefinieron la civilización occidental.

El sistema feudal se estableció como la estructura dominante, marcado por la descentralización política y una organización social estrictamente jerárquica. Los nobles feudales ejercían control sobre grandes territorios y dominaban completamente a los siervos que cultivaban sus tierras. Esta organización creó una compleja red de dependencias y obligaciones entre los diferentes estratos sociales.

La Iglesia Católica tuvo una influencia decisiva en la sociedad de la época, funcionando no solamente como autoridad espiritual sino también como poder temporal y económico. Los centros monásticos se transformaron en núcleos de enseñanza y conservación del saber antiguo durante los períodos más difíciles de la era medieval.

Las expediciones de las cruzadas fueron organizadas por el mundo cristiano occidental para reconquistar los lugares santos del dominio islámico. Estas campañas militares generaron importantes consecuencias económicas, sociales y culturales, promoviendo el intercambio comercial y el diálogo cultural entre el mundo oriental y occidental.

El estilo arquitectónico gótico se desarrolló en los siglos XII y XIII, destacando por sus majestuosas catedrales que se elevaban hacia las alturas como manifestaciones de la devoción cristiana. El arte gótico constituyó una innovación técnica y estética que marcó el desarrollo artístico de épocas posteriores.

La producción literaria medieval abarcaba obras heroicas como el Poema de Mío Cid y la literatura cortés que relataba las hazañas de nobles guerreros y damas. Estas creaciones literarias expresaban los principios y aspiraciones de la sociedad feudal, particularmente el código ético de la caballería.

Hacia el final del medioevo, el comercio experimentó un notable resurgimiento, especialmente con el florecimiento de las ciudades mercantiles italianas y el establecimiento de vías comerciales que unían Europa con los continentes asiático y africano.

Las instituciones universitarias medievales, como las de Bolonia, París y Oxford, fueron precursoras de la educación superior contemporánea y contribuyeron al despertar intelectual que caracterizó los últimos siglos del período medieval.
          `,
          "tesis_capitulo_1.pdf": `
La investigación en inteligencia artificial ha experimentado un crecimiento exponencial en las últimas décadas, transformando radicalmente nuestra comprensión de lo que las máquinas pueden lograr. Este campo interdisciplinario ha evolucionado desde conceptos teóricos hasta aplicaciones prácticas que impactan directamente en la vida cotidiana de millones de personas.

Los algoritmos de aprendizaje automático han revolucionado múltiples industrias, desde la medicina hasta las finanzas, proporcionando herramientas poderosas para el análisis de datos y la toma de decisiones. Estos sistemas pueden identificar patrones complejos en grandes volúmenes de información que serían imposibles de detectar mediante métodos tradicionales.

Las redes neuronales profundas han demostrado capacidades extraordinarias en el reconocimiento de patrones, superando en muchos casos el rendimiento humano en tareas específicas como el reconocimiento de imágenes y el procesamiento de señales. La arquitectura de estas redes imita, aunque de manera simplificada, el funcionamiento del cerebro humano.

El procesamiento de lenguaje natural permite a las máquinas comprender y generar texto humano con un nivel de sofisticación cada vez mayor. Esta tecnología ha hecho posible el desarrollo de asistentes virtuales, traductores automáticos y sistemas de análisis de sentimientos que pueden interpretar el contexto y las emociones en el texto.

Los sistemas de recomendación utilizan técnicas de IA para personalizar experiencias de usuario en plataformas digitales, analizando comportamientos pasados y preferencias para sugerir contenido relevante. Estos sistemas han transformado la forma en que consumimos entretenimiento, noticias y productos comerciales.

La visión por computadora ha avanzado significativamente gracias al deep learning, permitiendo a las máquinas interpretar y analizar imágenes y videos con precisión comparable a la humana. Esta tecnología tiene aplicaciones en seguridad, medicina, manufactura y muchos otros campos.

Los vehículos autónomos representan una aplicación práctica de múltiples tecnologías de IA, combinando visión por computadora, procesamiento de sensores, planificación de rutas y toma de decisiones en tiempo real. Estos sistemas prometen revolucionar el transporte y reducir significativamente los accidentes de tráfico.

La ética en IA se ha convertido en un tema crucial para el desarrollo responsable de estas tecnologías, abordando preocupaciones sobre privacidad, sesgo algorítmico, transparencia y el impacto social de la automatización. Es fundamental establecer marcos éticos sólidos para guiar el desarrollo futuro.

Los modelos de lenguaje grandes han transformado la forma en que interactuamos con la tecnología, permitiendo interfaces más naturales e intuitivas. Estos sistemas pueden generar texto coherente, responder preguntas complejas y asistir en tareas creativas y analíticas.

El futuro de la IA promete avances aún más revolucionarios en diversos campos, desde la medicina personalizada hasta la exploración espacial, con el potencial de resolver algunos de los desafíos más complejos que enfrenta la humanidad.
          `,
          "investigacion_previa.pdf": `
El campo de la inteligencia artificial ha mostrado un desarrollo acelerado en años recientes, revolucionando nuestra percepción sobre las capacidades computacionales. Esta disciplina multidisciplinaria ha progresado desde fundamentos teóricos hasta implementaciones prácticas que influyen directamente en el día a día de millones de individuos.

Los métodos de machine learning han transformado numerosos sectores industriales, desde el ámbito sanitario hasta el financiero, ofreciendo instrumentos avanzados para el análisis de información y la toma de decisiones estratégicas. Estos sistemas pueden reconocer patrones sofisticados en enormes conjuntos de datos que resultarían indetectables mediante enfoques convencionales.

Las arquitecturas de deep learning han exhibido habilidades excepcionales para el reconocimiento de patrones, excediendo frecuentemente el desempeño humano en actividades específicas como la identificación de imágenes y el procesamiento de señales. El diseño de estas redes emula, aunque de forma simplificada, el funcionamiento del sistema nervioso humano.

Las técnicas de NLP facilitan que los sistemas computacionales interpreten y produzcan lenguaje humano con un grado de complejidad progresivamente mayor. Esta tecnología ha posibilitado el desarrollo de asistentes digitales, sistemas de traducción automática y herramientas de análisis emocional que pueden interpretar el contexto y los sentimientos en el texto.

Los motores de recomendación emplean IA para crear experiencias personalizadas en plataformas digitales, examinando conductas previas y gustos para proponer contenido pertinente. Estos sistemas han modificado la manera en que accedemos a entretenimiento, información y productos comerciales.

El computer vision ha progresado notablemente mediante el uso de aprendizaje profundo, capacitando a las máquinas para interpretar y examinar imágenes y videos con exactitud equiparable a la humana. Esta tecnología encuentra aplicaciones en seguridad, medicina, producción industrial y numerosos otros sectores.

Los automóviles sin conductor ejemplifican la aplicación integrada de diversas tecnologías de IA, combinando visión artificial, procesamiento de sensores, planificación de trayectorias y toma de decisiones instantánea. Estos sistemas prometen transformar el transporte y disminuir considerablemente los accidentes viales.

Las consideraciones éticas en IA han emergido como fundamentales para un desarrollo responsable de estas tecnologías, tratando inquietudes sobre privacidad, prejuicio algorítmico, transparencia y el impacto social de la automatización. Es esencial establecer marcos éticos robustos para orientar el desarrollo futuro.

Los large language models han revolucionado nuestra interacción con sistemas tecnológicos, facilitando interfaces más naturales e intuitivas. Estos sistemas pueden producir texto coherente, responder consultas complejas y colaborar en tareas creativas y analíticas.

El horizonte de la IA sugiere innovaciones aún más disruptivas en múltiples disciplinas, desde la medicina personalizada hasta la exploración del espacio, con el potencial de abordar algunos de los retos más complejos que afronta la humanidad.
          `,
        }

        const fileName = file.name.toLowerCase()
        const text =
          mockTexts[fileName] ||
          `Contenido extraído del documento ${file.name}. Este texto representa el contenido real que sería extraído de un archivo PDF mediante bibliotecas especializadas como pdf-parse.`
        resolve(text.trim())
      }, processingTime)
    })
  } catch (error) {
    throw new Error(`Error al extraer texto del PDF: ${error}`)
  }
}

function preprocessText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\sáéíóúñü]/g, " ") // Keep Spanish characters
    .replace(/\s+/g, " ")
    .trim()
}

function createNGrams(text: string, n = 7): string[] {
  const words = text.split(" ").filter((word) => word.length > 2) // Filter short words
  const ngrams: string[] = []

  for (let i = 0; i <= words.length - n; i++) {
    const ngram = words.slice(i, i + n).join(" ")
    if (ngram.length > 25) {
      // Only consider substantial n-grams
      ngrams.push(ngram)
    }
  }

  return ngrams
}

function generateMatchColor(index: number): string {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E9",
    "#F8C471",
    "#82E0AA",
    "#F1948A",
    "#85C1E9",
    "#D7BDE2",
  ]
  return colors[index % colors.length]
}

function calculateJaccardSimilarity(textA: string, textB: string): number {
  const wordsA = new Set(preprocessText(textA).split(" "))
  const wordsB = new Set(preprocessText(textB).split(" "))

  const intersection = new Set([...wordsA].filter((x) => wordsB.has(x)))
  const union = new Set([...wordsA, ...wordsB])

  return intersection.size / union.size
}

function findMatches(textA: string, textB: string): PlagiarismMatch[] {
  const processedA = preprocessText(textA)
  const processedB = preprocessText(textB)

  const ngramsA = createNGrams(processedA, 7)
  const ngramsB = createNGrams(processedB, 7)

  const matches: PlagiarismMatch[] = []
  const wordsA = processedA.split(" ")
  const wordsB = processedB.split(" ")

  // Find exact matches
  ngramsA.forEach((ngramA, indexA) => {
    ngramsB.forEach((ngramB, indexB) => {
      const similarity = calculateStringSimilarity(ngramA, ngramB)

      if (similarity > 0.85) {
        // High similarity threshold
        const startA = indexA
        const endA = indexA + 7
        const startB = indexB
        const endB = indexB + 7

        matches.push({
          text: ngramA,
          startA,
          endA,
          startB,
          endB,
          similarity,
          color: generateMatchColor(matches.length),
        })
      }
    })
  })

  // Remove overlapping matches and keep the best ones
  const filteredMatches = matches
    .sort((a, b) => b.similarity - a.similarity)
    .filter((match, index, self) => {
      return !self
        .slice(0, index)
        .some(
          (prevMatch) => Math.abs(prevMatch.startA - match.startA) < 5 || Math.abs(prevMatch.startB - match.startB) < 5,
        )
    })
    .slice(0, 20) // Limit to top 20 matches
    .sort((a, b) => a.startA - b.startA)

  return filteredMatches
}

function calculateStringSimilarity(str1: string, str2: string): number {
  const len1 = str1.length
  const len2 = str2.length

  if (len1 === 0) return len2 === 0 ? 1 : 0
  if (len2 === 0) return 0

  const matrix = Array(len2 + 1)
    .fill(null)
    .map(() => Array(len1 + 1).fill(null))

  for (let i = 0; i <= len1; i++) matrix[0][i] = i
  for (let j = 0; j <= len2; j++) matrix[j][0] = j

  for (let j = 1; j <= len2; j++) {
    for (let i = 1; i <= len1; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(matrix[j][i - 1] + 1, matrix[j - 1][i] + 1, matrix[j - 1][i - 1] + indicator)
    }
  }

  const maxLen = Math.max(len1, len2)
  return (maxLen - matrix[len2][len1]) / maxLen
}

function calculateSimilarity(matches: PlagiarismMatch[], textA: string, textB: string): number {
  if (matches.length === 0) return 0

  const totalWordsA = preprocessText(textA).split(" ").length
  const totalWordsB = preprocessText(textB).split(" ").length
  const averageLength = (totalWordsA + totalWordsB) / 2

  const matchedWords = matches.reduce((sum, match) => sum + match.text.split(" ").length, 0)
  const basicSimilarity = (matchedWords / averageLength) * 100

  // Also consider Jaccard similarity
  const jaccardSimilarity = calculateJaccardSimilarity(textA, textB) * 100

  // Weighted average
  const finalSimilarity = basicSimilarity * 0.7 + jaccardSimilarity * 0.3

  return Math.min(Math.round(finalSimilarity), 100)
}

export async function detectPlagiarism(fileA: File, fileB: File): Promise<PlagiarismResult> {
  try {
    const textA = await extractTextFromPDF(fileA)
    const textB = await extractTextFromPDF(fileB)

    const matches = findMatches(textA, textB)
    const similarity = calculateSimilarity(matches, textA, textB)

    const result: PlagiarismResult = {
      id: generateId(),
      documentA: fileA.name,
      documentB: fileB.name,
      similarity,
      matches,
      totalMatches: matches.length,
      date: new Date().toISOString(),
      status: "completed",
      textA, // Store original texts
      textB,
    }

    return result
  } catch (error) {
    throw new Error(`Error en la detección de plagio: ${error}`)
  }
}

export function generateReport(result: PlagiarismResult): string {
  const riskLevel = result.similarity >= 70 ? "ALTO RIESGO" : result.similarity >= 40 ? "RIESGO MEDIO" : "BAJO RIESGO"

  const riskColor = result.similarity >= 70 ? "🔴" : result.similarity >= 40 ? "🟡" : "🟢"

  const report = `
REPORTE DE ANÁLISIS DE PLAGIO - PlagioCheck
==========================================

📄 DOCUMENTOS ANALIZADOS
Documento A: ${result.documentA}
Documento B: ${result.documentB}
Fecha de análisis: ${new Date(result.date).toLocaleString("es-ES")}

📊 RESUMEN EJECUTIVO
Porcentaje de similitud: ${result.similarity}%
Coincidencias encontradas: ${result.totalMatches}
Estado del análisis: ${result.status === "completed" ? "✅ Completado" : "⏳ En proceso"}

${riskColor} NIVEL DE RIESGO: ${riskLevel}
${
  result.similarity >= 70
    ? "⚠️  Se detectó un nivel significativo de similitud que requiere revisión inmediata"
    : result.similarity >= 40
      ? "⚠️  Se detectaron algunas similitudes que deben ser verificadas"
      : "✅ Nivel de similitud dentro de parámetros normales"
}

🔍 COINCIDENCIAS DETECTADAS
${
  result.matches.length > 0
    ? result.matches
        .map(
          (match, index) => `
${index + 1}. Similitud: ${Math.round(match.similarity * 100)}%
   Texto: "${match.text.substring(0, 100)}${match.text.length > 100 ? "..." : ""}"
   Posición en Doc A: palabras ${match.startA}-${match.endA}
   Posición en Doc B: palabras ${match.startB}-${match.endB}
`,
        )
        .join("")
    : "No se encontraron coincidencias significativas."
}

📋 RECOMENDACIONES
${
  result.similarity >= 70
    ? `• Revisar urgentemente las secciones marcadas como similares
• Verificar todas las citas y referencias bibliográficas
• Considerar parafrasear o reescribir el contenido similar
• Consultar con un supervisor académico`
    : result.similarity >= 40
      ? `• Revisar las coincidencias encontradas
• Asegurar el uso adecuado de citas y referencias
• Verificar la originalidad del contenido marcado
• Considerar parafrasear secciones similares`
      : `• El documento presenta un nivel aceptable de originalidad
• Continuar con las buenas prácticas de citación
• Mantener la calidad académica del trabajo`
}

📈 ESTADÍSTICAS TÉCNICAS
Algoritmo utilizado: N-gramas con similitud de Jaccard
Longitud de n-gramas: 7 palabras
Umbral de similitud: 85%
Coincidencias procesadas: ${result.totalMatches}

---
🔬 Generado por PlagioCheck - Sistema Avanzado de Detección de Plagio
📧 Para soporte técnico: soporte@plagiocheck.com
🌐 www.plagiocheck.com
  `.trim()

  return report
}
