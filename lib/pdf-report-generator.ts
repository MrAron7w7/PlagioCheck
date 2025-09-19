import jsPDF from "jspdf"
import type { PlagiarismResult } from "./gemini-client"

export interface ReportData {
  documents: { name: string; content: string }[]
  result: PlagiarismResult
  analysisDate: Date
}

export function generatePlagiarismReport(data: ReportData): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const margin = 20
  let yPosition = margin

  // Header
  doc.setFillColor(64, 123, 255) // Primary blue
  doc.rect(0, 0, pageWidth, 40, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont("helvetica", "bold")
  doc.text("REPORTE DE ANÁLISIS DE PLAGIO", pageWidth / 2, 25, { align: "center" })

  yPosition = 60

  // Document info
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text(`Fecha de análisis: ${data.analysisDate.toLocaleDateString("es-ES")}`, margin, yPosition)
  yPosition += 10
  doc.text(`Documentos analizados: ${data.documents.length}`, margin, yPosition)
  yPosition += 20

  // Overall similarity box
  doc.setFillColor(240, 240, 240)
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 30, "F")

  const similarityColor =
    data.result.overallSimilarity > 70
      ? [220, 53, 69]
      : data.result.overallSimilarity > 40
        ? [255, 193, 7]
        : [40, 167, 69]

  // doc.setTextColor(...similarityColor)
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text(`SIMILITUD GENERAL: ${data.result.overallSimilarity}%`, pageWidth / 2, yPosition + 20, { align: "center" })

  yPosition += 50

  // Summary
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("RESUMEN DEL ANÁLISIS", margin, yPosition)
  yPosition += 10

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  const summaryLines = doc.splitTextToSize(data.result.summary, pageWidth - 2 * margin)
  doc.text(summaryLines, margin, yPosition)
  yPosition += summaryLines.length * 5 + 20

  // Matches section
  if (data.result.matches.length > 0) {
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("COINCIDENCIAS DETECTADAS", margin, yPosition)
    yPosition += 15

    data.result.matches.forEach((match, index) => {
      if (yPosition > pageHeight - 60) {
        doc.addPage()
        yPosition = margin
      }

      // Match header
      doc.setFillColor(255, 248, 220)
      doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 25, "F")

      doc.setTextColor(0, 0, 0)
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text(`Coincidencia ${index + 1} - Similitud: ${match.similarity}%`, margin + 5, yPosition + 5)
      doc.text(`Fuente: ${match.sourceDocument}`, margin + 5, yPosition + 15)

      yPosition += 35

      // Original text
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text("Texto original:", margin, yPosition)
      yPosition += 8

      doc.setFont("helvetica", "normal")
      doc.setTextColor(220, 53, 69) // Red for highlighted text
      const originalLines = doc.splitTextToSize(match.originalText, pageWidth - 2 * margin)
      doc.text(originalLines, margin, yPosition)
      yPosition += originalLines.length * 5 + 10

      // Matched text
      doc.setTextColor(0, 0, 0)
      doc.setFont("helvetica", "bold")
      doc.text("Texto similar encontrado:", margin, yPosition)
      yPosition += 8

      doc.setFont("helvetica", "normal")
      doc.setTextColor(220, 53, 69) // Red for highlighted text
      const matchedLines = doc.splitTextToSize(match.matchedText, pageWidth - 2 * margin)
      doc.text(matchedLines, margin, yPosition)
      yPosition += matchedLines.length * 5 + 20
    })
  }

  // Recommendations
  if (data.result.recommendations.length > 0) {
    if (yPosition > pageHeight - 100) {
      doc.addPage()
      yPosition = margin
    }

    doc.setTextColor(0, 0, 0)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("RECOMENDACIONES", margin, yPosition)
    yPosition += 15

    data.result.recommendations.forEach((rec, index) => {
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      const recText = `${index + 1}. ${rec}`
      const recLines = doc.splitTextToSize(recText, pageWidth - 2 * margin)
      doc.text(recLines, margin, yPosition)
      yPosition += recLines.length * 5 + 5
    })
  }

  // Footer
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    doc.text(`Página ${i} de ${totalPages} - Generado por PlagioCheck`, pageWidth / 2, pageHeight - 10, {
      align: "center",
    })
  }

  // Save the PDF
  const fileName = `reporte-plagio-${data.analysisDate.toISOString().split("T")[0]}.pdf`
  doc.save(fileName)
}
