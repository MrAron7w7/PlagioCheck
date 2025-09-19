// PDF text extraction utility
export async function extractTextFromPDF(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer

        // For demo purposes, we'll simulate PDF text extraction
        // In a real implementation, you'd use a library like pdf-parse or PDF.js
        const text = await simulatePDFExtraction(file.name, arrayBuffer)
        resolve(text)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error("Error reading PDF file"))
    reader.readAsArrayBuffer(file)
  })
}

async function simulatePDFExtraction(fileName: string, arrayBuffer: ArrayBuffer): Promise<string> {
  // Simulate PDF text extraction with realistic academic content
  const sampleTexts = [
    `La inteligencia artificial (IA) ha revolucionado múltiples sectores de la sociedad moderna. Desde sus inicios en la década de 1950, la IA ha evolucionado desde simples algoritmos de búsqueda hasta complejos sistemas de aprendizaje automático capaces de realizar tareas que antes se consideraban exclusivamente humanas.

Los algoritmos de aprendizaje automático, particularmente las redes neuronales profundas, han demostrado capacidades extraordinarias en el reconocimiento de patrones, procesamiento de lenguaje natural y toma de decisiones. Estas tecnologías han encontrado aplicaciones en campos tan diversos como la medicina, donde ayudan en el diagnóstico de enfermedades, hasta la industria automotriz, donde impulsan el desarrollo de vehículos autónomos.

Sin embargo, el rápido avance de la IA también plantea importantes desafíos éticos y sociales. La automatización de empleos, la privacidad de los datos y la transparencia de los algoritmos son temas que requieren atención urgente de parte de investigadores, legisladores y la sociedad en general.

En el ámbito educativo, la IA está transformando la manera en que los estudiantes aprenden y los profesores enseñan. Los sistemas de tutoría inteligente pueden personalizar la experiencia de aprendizaje, adaptándose al ritmo y estilo de cada estudiante individual.`,

    `El cambio climático representa uno de los desafíos más apremiantes de nuestro tiempo. Las evidencias científicas demuestran de manera inequívoca que las actividades humanas, particularmente la emisión de gases de efecto invernadero, están alterando el sistema climático global de manera sin precedentes.

Los efectos del calentamiento global se manifiestan en múltiples formas: el aumento del nivel del mar, la intensificación de eventos climáticos extremos, la pérdida de biodiversidad y la alteración de los ecosistemas. Estos cambios no solo afectan el medio ambiente, sino que también tienen profundas implicaciones socioeconómicas.

La transición hacia fuentes de energía renovable se ha convertido en una prioridad global. La energía solar, eólica e hidroeléctrica están experimentando un crecimiento exponencial, impulsadas tanto por avances tecnológicos como por políticas gubernamentales favorables.

Las soluciones al cambio climático requieren un enfoque multidisciplinario que combine innovación tecnológica, políticas públicas efectivas y cambios en los patrones de consumo. La colaboración internacional es fundamental para abordar este desafío global que trasciende fronteras nacionales.`,

    `La educación superior en el siglo XXI enfrenta una transformación radical impulsada por la digitalización y las nuevas tecnologías. Las universidades tradicionales están adaptando sus modelos pedagógicos para incorporar herramientas digitales que enriquezcan la experiencia de aprendizaje.

El aprendizaje en línea ha demostrado ser una alternativa viable y, en muchos casos, complementaria a la educación presencial. Las plataformas de educación digital ofrecen flexibilidad y accesibilidad, permitiendo que estudiantes de diversas circunstancias geográficas y socioeconómicas accedan a educación de calidad.

La personalización del aprendizaje emerge como una tendencia clave, donde los sistemas adaptativos ajustan el contenido y la metodología según las necesidades individuales de cada estudiante. Esta aproximación promete mejorar significativamente los resultados educativos.

Sin embargo, la brecha digital sigue siendo un obstáculo importante. No todos los estudiantes tienen acceso equitativo a la tecnología y conectividad necesarias para participar plenamente en la educación digital, lo que puede exacerbar las desigualdades existentes.`,
  ]

  // Return a random sample text based on file name hash
  const hash = fileName.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0)
    return a & a
  }, 0)

  return sampleTexts[Math.abs(hash) % sampleTexts.length]
}
