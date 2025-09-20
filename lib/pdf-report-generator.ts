/* eslint-disable @typescript-eslint/no-explicit-any */
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface PlagiarismMatch {
  originalText: string;
  matchedText: string;
  similarity: number;
  startIndex: number;
  endIndex: number;
  sourceDocument: string;
  type?: "EXACTO" | "PARAFRASIS" | "SIMILAR";
}

export interface PlagiarismResult {
  overallSimilarity: number;
  matches: PlagiarismMatch[];
  summary: string;
  recommendations: string[];
}

export interface ReportData {
  documents: { name: string; content: string }[];
  result: PlagiarismResult;
  analysisDate: Date;
}

// Colores para diferentes niveles de similitud
const SIMILARITY_COLORS = {
  high: [220, 53, 69],    // Rojo para alta similitud
  medium: [255, 193, 7],  // Amarillo para media similitud
  low: [40, 167, 69],     // Verde para baja similitud
  primary: [64, 123, 255], // Azul primario
  lightGray: [248, 249, 250],
  darkGray: [52, 58, 64]
};

export function generatePlagiarismReport(data: ReportData): void {
  const doc = new jsPDF();
  (doc as any).autoTable = autoTable;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  let yPosition = margin;

  // Función para agregar nueva página si es necesario
  const checkPageBreak = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // 1. ENCABEZADO PROFESIONAL
  doc.setFillColor(SIMILARITY_COLORS.primary[0], SIMILARITY_COLORS.primary[1], SIMILARITY_COLORS.primary[2]);
  doc.rect(0, 0, pageWidth, 60, "F");
  
  // Logo y título
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("REPORTE DE ORIGINALIDAD", pageWidth / 2, 30, { align: "center" });
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Análisis de Similitud con Tecnología AI", pageWidth / 2, 45, { align: "center" });

  yPosition = 70;

  // 2. INFORMACIÓN DEL ANÁLISIS
  doc.setTextColor(SIMILARITY_COLORS.darkGray[0], SIMILARITY_COLORS.darkGray[1], SIMILARITY_COLORS.darkGray[2]);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("INFORMACIÓN DEL ANÁLISIS", margin, yPosition);
  yPosition += 8;
  
  doc.setFont("helvetica", "normal");
  const analysisDate = new Date(data.analysisDate);
  doc.text(`Fecha de análisis: ${analysisDate.toLocaleDateString("es-ES", {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, margin, yPosition);
  yPosition += 6;
  
  doc.text(`Documentos analizados: ${data.documents.map(d => d.name).join(" vs ")}`, margin, yPosition);
  yPosition += 15;

  // 3. TARJETA DE SIMILITUD GENERAL
  const similarityColor = data.result.overallSimilarity >= 70 ? SIMILARITY_COLORS.high : 
                       data.result.overallSimilarity >= 40 ? SIMILARITY_COLORS.medium : SIMILARITY_COLORS.low;
  
  doc.setFillColor(similarityColor[0], similarityColor[1], similarityColor[2]);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 25, 3, 3, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("SIMILITUD GENERAL", pageWidth / 2, yPosition + 10, { align: "center" });
  
  doc.setFontSize(20);
  doc.text(`${data.result.overallSimilarity}%`, pageWidth / 2, yPosition + 22, { align: "center" });
  yPosition += 35;

  // 4. INDICADOR DE RIESGO
  const riskLevel = data.result.overallSimilarity >= 70 ? "ALTO RIESGO" : 
                   data.result.overallSimilarity >= 40 ? "RIESGO MEDIO" : "BAJO RIESGO";
  
  const riskColor = data.result.overallSimilarity >= 70 ? SIMILARITY_COLORS.high : 
                       data.result.overallSimilarity >= 40 ? SIMILARITY_COLORS.medium : SIMILARITY_COLORS.low;
  
  doc.setFillColor(riskColor[0], riskColor[1], riskColor[2]);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 15, 3, 3, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(riskLevel, pageWidth / 2, yPosition + 10, { align: "center" });
  yPosition += 25;

  // 5. RESUMEN EJECUTIVO
  checkPageBreak(30);
  doc.setTextColor(SIMILARITY_COLORS.darkGray[0], SIMILARITY_COLORS.darkGray[1], SIMILARITY_COLORS.darkGray[2]);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("RESUMEN EJECUTIVO", margin, yPosition);
  yPosition += 8;
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const summaryLines = doc.splitTextToSize(data.result.summary, pageWidth - 2 * margin);
  doc.text(summaryLines, margin, yPosition);
  yPosition += summaryLines.length * 5 + 15;

  // 6. ESTADÍSTICAS DE COINCIDENCIAS
  if (data.result.matches && data.result.matches.length > 0) {
    checkPageBreak(50);
    
    // Gráfico de distribución de similitudes
    const similarityRanges = [
      { range: "90-100%", count: data.result.matches.filter(m => m.similarity >= 90).length, color: SIMILARITY_COLORS.high },
      { range: "70-89%", count: data.result.matches.filter(m => m.similarity >= 70 && m.similarity < 90).length, color: SIMILARITY_COLORS.medium },
      { range: "40-69%", count: data.result.matches.filter(m => m.similarity >= 40 && m.similarity < 70).length, color: SIMILARITY_COLORS.medium },
      { range: "0-39%", count: data.result.matches.filter(m => m.similarity < 40).length, color: SIMILARITY_COLORS.low }
    ];
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(SIMILARITY_COLORS.darkGray[0], SIMILARITY_COLORS.darkGray[1], SIMILARITY_COLORS.darkGray[2]);
    doc.text("DISTRIBUCIÓN DE SIMILITUDES", margin, yPosition);
    yPosition += 10;
    
    const chartWidth = pageWidth - 2 * margin;
    const chartHeight = 60;
    const barWidth = (chartWidth - 30) / similarityRanges.length;
    
    // Dibujar gráfico de barras
    let maxCount = Math.max(...similarityRanges.map(r => r.count));
    if (maxCount === 0) maxCount = 1;
    
    similarityRanges.forEach((range, index) => {
      const barHeight = range.count > 0 ? (range.count / maxCount) * chartHeight : 5;
      const x = margin + 15 + (index * barWidth);
      
      // Barra
      doc.setFillColor(range.color[0], range.color[1], range.color[2]);
      doc.rect(x, yPosition + chartHeight - barHeight, barWidth - 5, barHeight, "F");
      
      // Etiqueta
      doc.setFontSize(8);
      doc.setTextColor(SIMILARITY_COLORS.darkGray[0], SIMILARITY_COLORS.darkGray[1], SIMILARITY_COLORS.darkGray[2]);
      doc.text(range.range, x + (barWidth - 5) / 2, yPosition + chartHeight + 5, { align: "center" });
      
      // Valor
      doc.text(range.count.toString(), x + (barWidth - 5) / 2, yPosition + chartHeight - barHeight - 5, { align: "center" });
    });
    
    yPosition += chartHeight + 20;
    
    // Tabla de resumen de coincidencias
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("RESUMEN DE COINCIDENCIAS", margin, yPosition);
    yPosition += 10;
    
    const tableData = data.result.matches.map((match, index) => [
      `C-${index + 1}`,
      `${match.similarity}%`,
      match.type || "TEXTO",
      `${Math.round((match.endIndex - match.startIndex) / 5)} palabras`,
      match.sourceDocument
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['#', 'Similitud', 'Tipo', 'Longitud', 'Fuente']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [SIMILARITY_COLORS.primary[0], SIMILARITY_COLORS.primary[1], SIMILARITY_COLORS.primary[2]],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: [200, 200, 200]
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 25 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 'auto' }
      }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // 7. DETALLES DE COINCIDENCIAS
  if (data.result.matches && data.result.matches.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(SIMILARITY_COLORS.darkGray[0], SIMILARITY_COLORS.darkGray[1], SIMILARITY_COLORS.darkGray[2]);
    checkPageBreak(20);
    doc.text("DETALLES DE COINCIDENCIAS", margin, yPosition);
    yPosition += 15;
    
    data.result.matches.forEach((match, index) => {
      checkPageBreak(100);
      
      // Encabezado de coincidencia
      const matchColor = match.similarity >= 70 ? SIMILARITY_COLORS.high : 
                  match.similarity >= 40 ? SIMILARITY_COLORS.medium : SIMILARITY_COLORS.low;
      
      doc.setFillColor(matchColor[0], matchColor[1], matchColor[2]);
      doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 12, 2, 2, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`COINCIDENCIA ${index + 1} - ${match.similarity}% DE SIMILITUD`, margin + 5, yPosition + 8);
      yPosition += 15;
      
      // Información de la coincidencia
      doc.setTextColor(SIMILARITY_COLORS.darkGray[0], SIMILARITY_COLORS.darkGray[1], SIMILARITY_COLORS.darkGray[2]);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Tipo: ${match.type || "Texto"} | Fuente: ${match.sourceDocument} | Posición: ${match.startIndex}-${match.endIndex}`, margin, yPosition);
      yPosition += 8;
      
      // Texto original
      doc.setFont("helvetica", "bold");
      doc.text("TEXTO ORIGINAL:", margin, yPosition);
      yPosition += 5;
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      const originalLines = doc.splitTextToSize(match.originalText, pageWidth - 2 * margin);
      doc.text(originalLines, margin, yPosition);
      yPosition += originalLines.length * 4 + 8;
      
      // Texto coincidente
      doc.setFont("helvetica", "bold");
      doc.setTextColor(SIMILARITY_COLORS.darkGray[0], SIMILARITY_COLORS.darkGray[1], SIMILARITY_COLORS.darkGray[2]);
      doc.text("TEXTO COINCIDENTE:", margin, yPosition);
      yPosition += 5;
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      const matchedLines = doc.splitTextToSize(match.matchedText, pageWidth - 2 * margin);
      doc.text(matchedLines, margin, yPosition);
      yPosition += matchedLines.length * 4 + 15;
      
      // Barra de similitud
      const barWidth = pageWidth - 2 * margin;
      doc.setDrawColor(200, 200, 200);
      doc.rect(margin, yPosition, barWidth, 8, "S");
      
      const fillWidth = (match.similarity / 100) * barWidth;
      doc.setFillColor(matchColor[0], matchColor[1], matchColor[2]);
      doc.rect(margin, yPosition, fillWidth, 8, "F");
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(`${match.similarity}%`, margin + fillWidth / 2, yPosition + 5, { align: "center" });
      
      yPosition += 20;
    });
  }

  // 8. RECOMENDACIONES
  if (data.result.recommendations && data.result.recommendations.length > 0) {
    checkPageBreak(50);
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(SIMILARITY_COLORS.darkGray[0], SIMILARITY_COLORS.darkGray[1], SIMILARITY_COLORS.darkGray[2]);
    doc.text("RECOMENDACIONES", margin, yPosition);
    yPosition += 15;
    
    data.result.recommendations.forEach((rec, index) => {
      checkPageBreak(20);
      
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 10, 2, 2, "F");
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(64, 123, 255);
      doc.text(`${index + 1}.`, margin + 5, yPosition + 7);
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      const recLines = doc.splitTextToSize(rec, pageWidth - 2 * margin - 15);
      doc.text(recLines, margin + 15, yPosition + 7);
      
      yPosition += recLines.length * 4 + 12;
    });
  }

  // 9. FIRMA Y VALIDACIÓN
  checkPageBreak(40);
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(128, 128, 128);
  doc.text("Este reporte fue generado automáticamente por el Sistema de Detección de Plagio con IA", margin, yPosition);
  yPosition += 6;
  
  doc.text("Fecha de generación: " + analysisDate.toLocaleString("es-ES"), margin, yPosition);
  yPosition += 6;
  
  doc.text("Documento válido por 30 días", margin, yPosition);

  // 10. FOOTER EN TODAS LAS PÁGINAS
  const totalPages = doc.getNumberOfPages();
  const footerText = `Página {page_number} de {total_pages} - PlagioCheck AI - ${analysisDate.toLocaleDateString()}`;
  
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Línea footer
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
    
    // Texto footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(footerText.replace("{page_number}", i.toString()).replace("{total_pages}", totalPages.toString()), 
             pageWidth / 2, pageHeight - 15, { align: "center" });
  }

  // 11. GUARDAR PDF
  const fileName = `reporte-plagio-${data.documents[0].name}-vs-${data.documents[1].name}-${analysisDate.toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}

// Función auxiliar para generar texto con highlights
export function parseTextWithHighlights(
  text: string,
  matches: PlagiarismMatch[]
): { text: string; isHighlighted: boolean; color: string }[] {
  if (!text || !matches.length) return [{ text, isHighlighted: false, color: "" }];
  
  const result: { text: string; isHighlighted: boolean; color: string }[] = [];
  let lastIndex = 0;
  
  // Ordenar matches por startIndex
  const sortedMatches = [...matches].sort((a, b) => a.startIndex - b.startIndex);
  
  sortedMatches.forEach(match => {
    // Texto antes del match
    if (match.startIndex > lastIndex) {
      result.push({
        text: text.substring(lastIndex, match.startIndex),
        isHighlighted: false,
        color: ""
      });
    }
    
    // Texto del match
    const matchColor = match.similarity >= 70 ? `rgb(${SIMILARITY_COLORS.high.join(",")})` : 
                      match.similarity >= 40 ? `rgb(${SIMILARITY_COLORS.medium.join(",")})` : 
                      `rgb(${SIMILARITY_COLORS.low.join(",")})`;
    
    result.push({
      text: text.substring(match.startIndex, match.endIndex),
      isHighlighted: true,
      color: matchColor
    });
    
    lastIndex = match.endIndex;
  });
  
  // Texto restante después del último match
  if (lastIndex < text.length) {
    result.push({
      text: text.substring(lastIndex),
      isHighlighted: false,
      color: ""
    });
  }
  
  return result;
}