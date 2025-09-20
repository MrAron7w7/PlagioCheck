/* eslint-disable @typescript-eslint/no-explicit-any */
export interface HighlightedText {
  text: string;
  isHighlighted: boolean;
  color?: string;
  matchIndex?: number;
}

export function parseTextWithHighlights(
  text: string,
  matches: any[]
): HighlightedText[] {
  const words = text.split(" ");
  const result: HighlightedText[] = [];
  const currentIndex = 0;

  for (let i = 0; i < words.length; i++) {
    let isHighlighted = false;
    let matchColor = "";
    let matchIndex = -1;

    // Check if current word is part of any match
    for (let j = 0; j < matches.length; j++) {
      const match = matches[j];
      if (i >= match.startA && i < match.endA) {
        isHighlighted = true;
        matchColor = match.color;
        matchIndex = j;
        break;
      }
    }

    result.push({
      text: words[i],
      isHighlighted,
      color: matchColor,
      matchIndex,
    });
  }

  return result;
}

export async function generatePlagiarismPDF(result: any): Promise<Blob> {
  // For now, we'll create an HTML-based PDF using the browser's print functionality
  // In a real implementation, you would use pdf-lib or similar library

  const highlightedTextA = parseTextWithHighlights(
    result.textA,
    result.matches
  );
  const highlightedTextB = parseTextWithHighlights(
    result.textB,
    result.matches.map((m: any) => ({
      ...m,
      startA: m.startB,
      endA: m.endB,
    }))
  );

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Reporte de Plagio - ${result.documentA} vs ${
    result.documentB
  }</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background: white;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #1e40af;
            margin: 0;
            font-size: 28px;
        }
        .header p {
            color: #64748b;
            margin: 5px 0;
        }
        .summary {
            background: #f8fafc;
            border-left: 4px solid #2563eb;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        .similarity-score {
            font-size: 48px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
            color: ${
              result.similarity >= 70
                ? "#dc2626"
                : result.similarity >= 40
                ? "#d97706"
                : "#16a34a"
            };
        }
        .risk-level {
            text-align: center;
            padding: 10px;
            border-radius: 8px;
            margin: 20px 0;
            font-weight: bold;
            background: ${
              result.similarity >= 70
                ? "#fee2e2"
                : result.similarity >= 40
                ? "#fef3c7"
                : "#dcfce7"
            };
            color: ${
              result.similarity >= 70
                ? "#dc2626"
                : result.similarity >= 40
                ? "#d97706"
                : "#16a34a"
            };
        }
        .document-section {
            margin: 30px 0;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            overflow: hidden;
        }
        .document-header {
            background: #1e40af;
            color: white;
            padding: 15px;
            font-weight: bold;
        }
        .document-content {
            padding: 20px;
            max-height: 400px;
            overflow-y: auto;
            line-height: 1.8;
        }
        .highlight {
            padding: 2px 4px;
            border-radius: 3px;
            font-weight: 500;
            position: relative;
        }
        .match-legend {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin: 20px 0;
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
        }
        .legend-item {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 12px;
        }
        .legend-color {
            width: 16px;
            height: 16px;
            border-radius: 3px;
        }
        .matches-summary {
            margin: 20px 0;
        }
        .match-item {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            margin: 10px 0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .match-text {
            font-style: italic;
            color: #374151;
            margin: 10px 0;
            padding: 10px;
            background: #f9fafb;
            border-radius: 4px;
        }
        @media print {
            body { margin: 0; }
            .document-content { max-height: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 REPORTE DE ANÁLISIS DE PLAGIO</h1>
        <p><strong>PlagioCheck</strong> - Sistema Avanzado de Detección de Plagio</p>
        <p>Generado el ${new Date(result.date).toLocaleString("es-ES")}</p>
    </div>

    <div class="summary">
        <h2>📋 Resumen Ejecutivo</h2>
        <p><strong>Documento A:</strong> ${result.documentA}</p>
        <p><strong>Documento B:</strong> ${result.documentB}</p>
        <p><strong>Coincidencias encontradas:</strong> ${
          result.totalMatches
        }</p>
        
        <div class="similarity-score">${result.similarity}%</div>
        
        <div class="risk-level">
            ${
              result.similarity >= 70
                ? "🔴 ALTO RIESGO"
                : result.similarity >= 40
                ? "🟡 RIESGO MEDIO"
                : "🟢 BAJO RIESGO"
            }
        </div>
    </div>

    ${
      result.matches.length > 0
        ? `
    <div class="match-legend">
        <h3 style="width: 100%; margin: 0 0 10px 0;">🎨 Leyenda de Colores:</h3>
        ${result.matches
          .map(
            (match: any, index: number) => `
            <div class="legend-item">
                <div class="legend-color" style="background-color: ${
                  match.color
                }"></div>
                <span>Coincidencia ${index + 1}</span>
            </div>
        `
          )
          .join("")}
    </div>
    `
        : ""
    }

    <div class="document-section">
        <div class="document-header">📄 ${result.documentA}</div>
        <div class="document-content">
            ${highlightedTextA
              .map((item) =>
                item.isHighlighted
                  ? `<span class="highlight" style="background-color: ${item.color}; color: white;">${item.text}</span>`
                  : item.text
              )
              .join(" ")}
        </div>
    </div>

    <div class="document-section">
        <div class="document-header">📄 ${result.documentB}</div>
        <div class="document-content">
            ${highlightedTextB
              .map((item) =>
                item.isHighlighted
                  ? `<span class="highlight" style="background-color: ${item.color}; color: white;">${item.text}</span>`
                  : item.text
              )
              .join(" ")}
        </div>
    </div>

    ${
      result.matches.length > 0
        ? `
    <div class="matches-summary">
        <h2>🔍 Detalle de Coincidencias</h2>
        ${result.matches
          .map(
            (match: any, index: number) => `
            <div class="match-item">
                <h4 style="color: ${match.color}; margin: 0 0 10px 0;">
                    Coincidencia ${index + 1} - Similitud: ${Math.round(
              match.similarity * 100
            )}%
                </h4>
                <div class="match-text">"${match.text}"</div>
                <p><small>
                    <strong>Posición en ${
                      result.documentA
                    }:</strong> palabras ${match.startA}-${match.endA} | 
                    <strong>Posición en ${
                      result.documentB
                    }:</strong> palabras ${match.startB}-${match.endB}
                </small></p>
            </div>
        `
          )
          .join("")}
    </div>
    `
        : ""
    }

    <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center; color: #64748b;">
        <p><strong>PlagioCheck</strong> - Detección de Plagio con IA</p>
        <p>Este reporte fue generado automáticamente usando algoritmos avanzados de comparación de texto</p>
    </div>
</body>
</html>
  `;

  // Convert HTML to Blob for download
  const blob = new Blob([htmlContent], { type: "text/html" });
  return blob;
}

export function downloadPDF(result: any) {
  generatePlagiarismPDF(result).then((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte-plagio-${result.documentA}-vs-${result.documentB}-${
      new Date().toISOString().split("T")[0]
    }.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}
