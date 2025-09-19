"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  Eye,
  Download,
  Brain,
  Sparkles,
} from "lucide-react";
import {
  generatePlagiarismReport,
  type ReportData,
} from "@/lib/pdf-report-generator";

export function ResultsComparison() {
  const [results, setResults] = useState<any[]>([]);
  const [selectedResult, setSelectedResult] = useState<any | null>(null);

  useEffect(() => {
    const savedResults = localStorage.getItem("plagiarism-results");
    if (savedResults) {
      setResults(JSON.parse(savedResults));
    }
  }, []);

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 70) return "text-red-600 bg-red-50 border-red-200";
    if (similarity >= 40)
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-green-600 bg-green-50 border-green-200";
  };

  const getSimilarityIcon = (similarity: number) => {
    if (similarity >= 70) return <AlertTriangle className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  const getSimilarityLabel = (similarity: number) => {
    if (similarity >= 70) return "Alto Riesgo";
    if (similarity >= 40) return "Riesgo Medio";
    return "Bajo Riesgo";
  };

  const handleDownloadPDF = (result: any) => {
    const reportData: ReportData = {
      documents: result.documents?.map((name: string) => ({
        name,
        content: "",
      })) || [
        {
          name: result.documentA || "Documento A",
          content: result.textA || "",
        },
        {
          name: result.documentB || "Documento B",
          content: result.textB || "",
        },
      ],
      result: {
        overallSimilarity: result.overallSimilarity || result.similarity || 0,
        matches: result.matches || [],
        summary:
          result.summary ||
          `Análisis completado con ${
            result.overallSimilarity || result.similarity
          }% de similitud`,
        recommendations: result.recommendations || [
          "Revisa las coincidencias encontradas",
          "Considera citar las fuentes apropiadamente",
        ],
      },
      analysisDate: result.analysisDate
        ? new Date(result.analysisDate)
        : new Date(),
    };

    generatePlagiarismReport(reportData);
  };

  const highRiskCount = results.filter(
    (r) => (r.overallSimilarity || r.similarity) >= 70
  ).length;
  const mediumRiskCount = results.filter((r) => {
    const sim = r.overallSimilarity || r.similarity;
    return sim >= 40 && sim < 70;
  }).length;
  const lowRiskCount = results.filter(
    (r) => (r.overallSimilarity || r.similarity) < 40
  ).length;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {highRiskCount}
                </p>
                <p className="text-sm text-muted-foreground">Alto Riesgo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {mediumRiskCount}
                </p>
                <p className="text-sm text-muted-foreground">Riesgo Medio</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {lowRiskCount}
                </p>
                <p className="text-sm text-muted-foreground">Bajo Riesgo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Resultados de Análisis con IA
          </CardTitle>
          <CardDescription>
            Resultados de las comparaciones de plagio realizadas con Gemini AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.map((result) => {
              const similarity =
                result.overallSimilarity || result.similarity || 0;
              const matchCount =
                result.matches?.length || result.totalMatches || 0;

              return (
                <div key={result.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Document names */}
                      <div className="space-y-1">
                        {result.documents ? (
                          result.documents.map((doc: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-sm"
                            >
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{doc}</span>
                              {result.analysisType && (
                                <Badge variant="secondary" className="ml-2">
                                  <Brain className="h-3 w-3 mr-1" />
                                  {result.analysisType}
                                </Badge>
                              )}
                            </div>
                          ))
                        ) : (
                          <>
                            <div className="flex items-center gap-2 text-sm">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {result.documentA}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span className="ml-6">vs</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {result.documentB}
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Similarity */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Similitud</span>
                          <span className="text-sm font-bold">
                            {similarity}%
                          </span>
                        </div>
                        <Progress value={similarity} className="h-2" />
                        <div className="flex items-center justify-between">
                          <Badge
                            variant="outline"
                            className={getSimilarityColor(similarity)}
                          >
                            {getSimilarityIcon(similarity)}
                            <span className="ml-1">
                              {getSimilarityLabel(similarity)}
                            </span>
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {matchCount} coincidencias encontradas
                          </span>
                        </div>
                      </div>

                      {result.analysisDate && (
                        <div className="text-xs text-muted-foreground">
                          Analizado el{" "}
                          {new Date(result.analysisDate).toLocaleDateString(
                            "es-ES"
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedResult(result)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalles
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full">
                          <DialogHeader className="pb-4">
                            <DialogTitle className="flex items-center gap-2">
                              <Brain className="h-5 w-5" />
                              Análisis Detallado con IA
                            </DialogTitle>
                            <DialogDescription>
                              {result.documents
                                ? `Comparación entre ${result.documents.length} documentos`
                                : `Comparación entre ${result.documentA} y ${result.documentB}`}
                            </DialogDescription>
                          </DialogHeader>

                          <ScrollArea className="flex-1 pr-4">
                            <div className="space-y-6">
                              {/* Summary Cards */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card>
                                  <CardContent className="pt-4">
                                    <div className="text-center">
                                      <div
                                        className="text-3xl font-bold mb-2"
                                        style={{
                                          color:
                                            similarity >= 70
                                              ? "#dc2626"
                                              : similarity >= 40
                                              ? "#d97706"
                                              : "#16a34a",
                                        }}
                                      >
                                        {similarity}%
                                      </div>
                                      <p className="text-sm text-muted-foreground">
                                        Similitud Total
                                      </p>
                                    </div>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="pt-4">
                                    <div className="text-center">
                                      <div className="text-3xl font-bold mb-2 text-blue-600">
                                        {matchCount}
                                      </div>
                                      <p className="text-sm text-muted-foreground">
                                        Coincidencias
                                      </p>
                                    </div>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="pt-4">
                                    <div className="text-center">
                                      <Badge
                                        className={getSimilarityColor(
                                          similarity
                                        )}
                                      >
                                        {getSimilarityIcon(similarity)}
                                        <span className="ml-1">
                                          {getSimilarityLabel(similarity)}
                                        </span>
                                      </Badge>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>

                              {/* AI Summary */}
                              {result.summary && (
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                      <Sparkles className="h-5 w-5" />
                                      Resumen del Análisis IA
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <p className="text-sm leading-relaxed">
                                      {result.summary}
                                    </p>
                                  </CardContent>
                                </Card>
                              )}

                              {/* AI Recommendations */}
                              {result.recommendations &&
                                result.recommendations.length > 0 && (
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-lg flex items-center gap-2">
                                        <Brain className="h-5 w-5" />
                                        Recomendaciones IA
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <ul className="space-y-2">
                                        {result.recommendations.map(
                                          (rec: string, index: number) => (
                                            <li
                                              key={index}
                                              className="flex items-start gap-2 text-sm"
                                            >
                                              <span className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary mt-0.5">
                                                {index + 1}
                                              </span>
                                              <span className="leading-relaxed">
                                                {rec}
                                              </span>
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    </CardContent>
                                  </Card>
                                )}

                              {/* Matches Section */}
                              {result.matches && result.matches.length > 0 && (
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">
                                      Coincidencias Detectadas por IA
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-4">
                                      {result.matches.map(
                                        (match: any, index: number) => (
                                          <div
                                            key={index}
                                            className="p-4 border rounded-lg bg-muted/30"
                                          >
                                            <div className="flex items-center justify-between mb-3">
                                              <div className="flex items-center gap-2">
                                                <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                                  {index + 1}
                                                </span>
                                                <span className="font-medium">
                                                  Coincidencia #{index + 1}
                                                </span>
                                              </div>
                                              <Badge variant="secondary">
                                                {match.similarity}% similar
                                              </Badge>
                                            </div>

                                            <div className="space-y-3">
                                              <div>
                                                <p className="text-sm font-medium mb-1">
                                                  Texto original:
                                                </p>
                                                <div className="bg-red-50 border border-red-200 p-3 rounded text-sm">
                                                  <p className="text-red-800">
                                                    "{match.originalText}"
                                                  </p>
                                                </div>
                                              </div>

                                              <div>
                                                <p className="text-sm font-medium mb-1">
                                                  Texto similar encontrado:
                                                </p>
                                                <div className="bg-red-50 border border-red-200 p-3 rounded text-sm">
                                                  <p className="text-red-800">
                                                    "{match.matchedText}"
                                                  </p>
                                                </div>
                                              </div>

                                              <div className="text-xs text-muted-foreground">
                                                <span>
                                                  Fuente: {match.sourceDocument}
                                                </span>
                                                <span className="mx-2">•</span>
                                                <span>
                                                  Posición: {match.startIndex}-
                                                  {match.endIndex}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              )}

                              {/* Download Actions */}
                              <div className="flex gap-2 justify-end pt-4 border-t">
                                <Button
                                  onClick={() => handleDownloadPDF(result)}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Descargar Reporte PDF
                                </Button>
                              </div>
                            </div>
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadPDF(result)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {results.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">
                No hay resultados disponibles
              </h3>
              <p className="text-sm text-muted-foreground">
                Sube documentos y ejecuta un análisis con IA para ver los
                resultados aquí.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
