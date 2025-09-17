export interface PlagiarismMatch {
  text: string
  startA: number
  endA: number
  startB: number
  endB: number
  similarity: number
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
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

// Simulate PDF text extraction (in real app, use pdf-parse library)
export async function extractTextFromPDF(file: File): Promise<string> {
  return new Promise((resolve) => {
    // Simulate PDF processing delay
    setTimeout(
      () => {
        // Mock extracted text based on filename
        const mockTexts: Record<string, string> = {
          "ensayo_historia_medieval.pdf": `
          La Edad Media, también conocida como el Medioevo, fue un período histórico que abarcó desde el siglo V hasta el siglo XV.
          Durante este tiempo, Europa experimentó profundos cambios sociales, políticos y culturales.
          El feudalismo se convirtió en el sistema dominante, caracterizado por la descentralización del poder.
          Los señores feudales controlaban vastas extensiones de tierra y tenían autoridad sobre los campesinos.
          La Iglesia Católica desempeñó un papel fundamental en la sociedad medieval.
          Las cruzadas fueron expediciones militares organizadas por la cristiandad occidental.
          El arte gótico floreció durante los siglos XII y XIII, caracterizado por sus catedrales imponentes.
          La literatura medieval incluía obras como el Cantar de Mío Cid y los romances cortesanos.
          El comercio comenzó a revitalizarse hacia el final del período medieval.
          Las universidades medievales sentaron las bases de la educación superior moderna.
        `,
          "trabajo_edad_media.pdf": `
          El período medieval, conocido como Edad Media, se extendió desde el siglo V hasta el XV.
          Europa vivió transformaciones significativas en los aspectos sociales, políticos y culturales durante esta época.
          El sistema feudal se estableció como la estructura dominante, marcado por la descentralización política.
          Los nobles feudales ejercían control sobre grandes territorios y dominaban a los siervos.
          La Iglesia Católica tuvo una influencia decisiva en la sociedad de la época.
          Las expediciones de las cruzadas fueron organizadas por el mundo cristiano occidental.
          El estilo arquitectónico gótico se desarrolló en los siglos XII y XIII, destacando por sus majestuosas catedrales.
          La producción literaria medieval abarcaba obras como el Poema de Mío Cid y la literatura cortés.
          Hacia el final del medioevo, el comercio experimentó un notable resurgimiento.
          Las instituciones universitarias medievales fueron precursoras de la educación superior contemporánea.
        `,
          "tesis_capitulo_1.pdf": `
          La investigación en inteligencia artificial ha experimentado un crecimiento exponencial en las últimas décadas.
          Los algoritmos de aprendizaje automático han revolucionado múltiples industrias.
          Las redes neuronales profundas han demostrado capacidades extraordinarias en el reconocimiento de patrones.
          El procesamiento de lenguaje natural permite a las máquinas comprender y generar texto humano.
          Los sistemas de recomendación utilizan técnicas de IA para personalizar experiencias de usuario.
          La visión por computadora ha avanzado significativamente gracias al deep learning.
          Los vehículos autónomos representan una aplicación práctica de múltiples tecnologías de IA.
          La ética en IA se ha convertido en un tema crucial para el desarrollo responsable.
          Los modelos de lenguaje grandes han transformado la forma en que interactuamos con la tecnología.
          El futuro de la IA promete avances aún más revolucionarios en diversos campos.
        `,
          "investigacion_previa.pdf": `
          El campo de la inteligencia artificial ha mostrado un desarrollo acelerado en años recientes.
          Los métodos de machine learning han transformado numerosos sectores industriales.
          Las arquitecturas de deep learning han exhibido habilidades excepcionales para el reconocimiento de patrones.
          Las técnicas de NLP facilitan que los sistemas computacionales interpreten y produzcan lenguaje humano.
          Los motores de recomendación emplean IA para crear experiencias personalizadas.
          El computer vision ha progresado notablemente mediante el uso de aprendizaje profundo.
          Los automóviles sin conductor ejemplifican la aplicación integrada de diversas tecnologías de IA.
          Las consideraciones éticas en IA han emergido como fundamentales para un desarrollo responsable.
          Los large language models han revolucionado nuestra interacción con sistemas tecnológicos.
          El horizonte de la IA sugiere innovaciones aún más disruptivas en múltiples disciplinas.
        `,
        }

        const fileName = file.name.toLowerCase()
        const text =
          mockTexts[fileName] ||
          `Texto extraído del documento ${file.name}. Este es un contenido de ejemplo para demostrar la funcionalidad de extracción de texto de PDFs.`
        resolve(text.trim())
      },
      1000 + Math.random() * 2000,
    )
  })
}

// Text preprocessing
function preprocessText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

// Create n-grams for comparison
function createNGrams(text: string, n = 5): string[] {
  const words = text.split(" ")
  const ngrams: string[] = []

  for (let i = 0; i <= words.length - n; i++) {
    ngrams.push(words.slice(i, i + n).join(" "))
  }

  return ngrams
}

// Find matching n-grams between two texts
function findMatches(textA: string, textB: string): PlagiarismMatch[] {
  const processedA = preprocessText(textA)
  const processedB = preprocessText(textB)

  const ngramsA = createNGrams(processedA, 5)
  const ngramsB = createNGrams(processedB, 5)

  const matches: PlagiarismMatch[] = []
  const wordsA = processedA.split(" ")
  const wordsB = processedB.split(" ")

  ngramsA.forEach((ngramA, indexA) => {
    ngramsB.forEach((ngramB, indexB) => {
      if (ngramA === ngramB && ngramA.length > 20) {
        // Only consider substantial matches
        const startA = indexA
        const endA = indexA + 5
        const startB = indexB
        const endB = indexB + 5

        matches.push({
          text: ngramA,
          startA,
          endA,
          startB,
          endB,
          similarity: 1.0,
        })
      }
    })
  })

  // Remove duplicate matches and sort by position
  const uniqueMatches = matches
    .filter((match, index, self) => index === self.findIndex((m) => m.text === match.text))
    .sort((a, b) => a.startA - b.startA)

  return uniqueMatches
}

// Calculate overall similarity percentage
function calculateSimilarity(matches: PlagiarismMatch[], textA: string, textB: string): number {
  if (matches.length === 0) return 0

  const totalWordsA = preprocessText(textA).split(" ").length
  const totalWordsB = preprocessText(textB).split(" ").length
  const averageLength = (totalWordsA + totalWordsB) / 2

  const matchedWords = matches.reduce((sum, match) => sum + match.text.split(" ").length, 0)

  return Math.min(Math.round((matchedWords / averageLength) * 100), 100)
}

// Main plagiarism detection function
export async function detectPlagiarism(fileA: File, fileB: File): Promise<PlagiarismResult> {
  const textA = await extractTextFromPDF(fileA)
  const textB = await extractTextFromPDF(fileB)

  const matches = findMatches(textA, textB)
  const similarity = calculateSimilarity(matches, textA, textB)

  const result: PlagiarismResult = {
    id: generateId(), // Use browser-compatible ID generation
    documentA: fileA.name,
    documentB: fileB.name,
    similarity,
    matches,
    totalMatches: matches.length,
    date: new Date().toISOString(),
    status: "completed",
  }

  return result
}

// Generate report for download
export function generateReport(result: PlagiarismResult): string {
  const report = `
REPORTE DE ANÁLISIS DE PLAGIO
=============================

Documento A: ${result.documentA}
Documento B: ${result.documentB}
Fecha de análisis: ${new Date(result.date).toLocaleString("es-ES")}

RESUMEN
-------
Porcentaje de similitud: ${result.similarity}%
Coincidencias encontradas: ${result.totalMatches}
Estado del análisis: ${result.status === "completed" ? "Completado" : "En proceso"}

NIVEL DE RIESGO
---------------
${
  result.similarity >= 70
    ? "ALTO RIESGO - Se detectó un nivel significativo de similitud"
    : result.similarity >= 40
      ? "RIESGO MEDIO - Se detectaron algunas similitudes"
      : "BAJO RIESGO - Nivel de similitud dentro de parámetros normales"
}

COINCIDENCIAS DETECTADAS
------------------------
${result.matches
  .map(
    (match, index) => `
${index + 1}. "${match.text}"
   Similitud: ${Math.round(match.similarity * 100)}%
`,
  )
  .join("")}

RECOMENDACIONES
---------------
${
  result.similarity >= 70
    ? "- Revisar las secciones marcadas como similares\n- Verificar las citas y referencias\n- Considerar parafrasear el contenido similar"
    : result.similarity >= 40
      ? "- Revisar las coincidencias encontradas\n- Asegurar el uso adecuado de citas\n- Verificar la originalidad del contenido"
      : "- El documento presenta un nivel aceptable de originalidad\n- Continuar con las buenas prácticas de citación"
}

---
Generado por PlagioCheck - Sistema de Detección de Plagio
  `.trim()

  return report
}
