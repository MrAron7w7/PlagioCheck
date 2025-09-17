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
  RefreshCw,
} from "lucide-react";
import {
  type PlagiarismResult,
  generateReport,
} from "@/lib/plagiarism-detector";
import { downloadPDF } from "@/lib/pdf-generator";

export function ResultsComparison() {
  const [results, setResults] = useState<PlagiarismResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<PlagiarismResult | null>(
    null
  );

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

  const handleDownload = (
    result: PlagiarismResult,
    format: "txt" | "pdf" = "txt"
  ) => {
    if (format === "pdf") {
      downloadPDF(result);
    } else {
      const report = generateReport(result);
      const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `reporte-plagio-${result.id.substring(0, 8)}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const HighlightedText = ({
    text,
    matches,
    isDocumentA = true,
  }: {
    text: string;
    matches: any[];
    isDocumentA?: boolean;
  }) => {
    const words = text.split(" ");

    return (
      <div className="text-sm leading-relaxed">
        {words
          .map((word, index) => {
            const match = matches.find((m) => {
              const start = isDocumentA ? m.startA : m.startB;
              const end = isDocumentA ? m.endA : m.endB;
              return index >= start && index < end;
            });

            if (match) {
              return (
                <span
                  key={index}
                  className="px-1 py-0.5 rounded text-white font-medium"
                  style={{ backgroundColor: match.color }}
                  title={`Coincidencia ${
                    matches.indexOf(match) + 1
                  } - ${Math.round(match.similarity * 100)}% similar`}
                >
                  {word}
                </span>
              );
            }

            return <span key={index}>{word}</span>;
          })
          .reduce((prev, curr, index) => [prev, " ", curr])}
      </div>
    );
  };

  const highRiskCount = results.filter((r) => r.similarity >= 70).length;
  const mediumRiskCount = results.filter(
    (r) => r.similarity >= 40 && r.similarity < 70
  ).length;
  const lowRiskCount = results.filter((r) => r.similarity < 40).length;

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
            <FileText className="h-5 w-5" />
            Resultados de Comparación
          </CardTitle>
          <CardDescription>
            Resultados de las comparaciones de plagio realizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.map((result) => (
              <div key={result.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Document names */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{result.documentA}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="ml-6">vs</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{result.documentB}</span>
                      </div>
                    </div>

                    {/* Similarity */}
                    {result.status === "completed" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Similitud</span>
                          <span className="text-sm font-bold">
                            {result.similarity}%
                          </span>
                        </div>
                        <Progress value={result.similarity} className="h-2" />
                        <div className="flex items-center justify-between">
                          <Badge
                            variant="outline"
                            className={getSimilarityColor(result.similarity)}
                          >
                            {getSimilarityIcon(result.similarity)}
                            <span className="ml-1">
                              {getSimilarityLabel(result.similarity)}
                            </span>
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {result.totalMatches} coincidencias encontradas
                          </span>
                        </div>
                      </div>
                    )}

                    {result.status === "processing" && (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">
                          Procesando...
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {result.status === "completed" && (
                      <>
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
                          <DialogContent className="max-w-6xl max-h-[90vh]">
                            <DialogHeader>
                              <DialogTitle>
                                Análisis Detallado de Plagio
                              </DialogTitle>
                              <DialogDescription>
                                Comparación completa entre {result.documentA} y{" "}
                                {result.documentB}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card>
                                  <CardContent className="pt-4">
                                    <div className="text-center">
                                      <div
                                        className="text-3xl font-bold mb-2"
                                        style={{
                                          color:
                                            result.similarity >= 70
                                              ? "#dc2626"
                                              : result.similarity >= 40
                                              ? "#d97706"
                                              : "#16a34a",
                                        }}
                                      >
                                        {result.similarity}%
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
                                        {result.totalMatches}
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
                                          result.similarity
                                        )}
                                      >
                                        {getSimilarityIcon(result.similarity)}
                                        <span className="ml-1">
                                          {getSimilarityLabel(
                                            result.similarity
                                          )}
                                        </span>
                                      </Badge>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>

                              {result.matches.length > 0 && (
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">
                                      Leyenda de Colores
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                      {result.matches.map((match, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center gap-2 text-sm"
                                        >
                                          <div
                                            className="w-4 h-4 rounded"
                                            style={{
                                              backgroundColor: match.color,
                                            }}
                                          />
                                          <span>
                                            Coincidencia {index + 1} (
                                            {Math.round(match.similarity * 100)}
                                            %)
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>
                              )}

                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                      <FileText className="h-5 w-5" />
                                      {result.documentA}
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <ScrollArea className="h-96">
                                      <HighlightedText
                                        text={result.textA}
                                        matches={result.matches}
                                        isDocumentA={true}
                                      />
                                    </ScrollArea>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                      <FileText className="h-5 w-5" />
                                      {result.documentB}
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <ScrollArea className="h-96">
                                      <HighlightedText
                                        text={result.textB}
                                        matches={result.matches}
                                        isDocumentA={false}
                                      />
                                    </ScrollArea>
                                  </CardContent>
                                </Card>
                              </div>

                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">
                                    Coincidencias Detectadas
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <ScrollArea className="h-64">
                                    <div className="space-y-3">
                                      {result.matches.length > 0 ? (
                                        result.matches.map((match, index) => (
                                          <div
                                            key={index}
                                            className="p-4 border rounded-lg"
                                          >
                                            <div className="flex items-center justify-between mb-3">
                                              <div className="flex items-center gap-2">
                                                <div
                                                  className="w-4 h-4 rounded"
                                                  style={{
                                                    backgroundColor:
                                                      match.color,
                                                  }}
                                                />
                                                <span className="font-medium">
                                                  Coincidencia #{index + 1}
                                                </span>
                                              </div>
                                              <Badge variant="secondary">
                                                {Math.round(
                                                  match.similarity * 100
                                                )}
                                                % similar
                                              </Badge>
                                            </div>
                                            <div className="bg-muted p-3 rounded text-sm">
                                              <p className="italic">
                                                "{match.text}"
                                              </p>
                                            </div>
                                            <div className="mt-2 text-xs text-muted-foreground">
                                              <span>
                                                Posición en {result.documentA}:
                                                palabras {match.startA}-
                                                {match.endA}
                                              </span>
                                              <span className="mx-2">•</span>
                                              <span>
                                                Posición en {result.documentB}:
                                                palabras {match.startB}-
                                                {match.endB}
                                              </span>
                                            </div>
                                          </div>
                                        ))
                                      ) : (
                                        <p className="text-sm text-muted-foreground text-center py-4">
                                          No se encontraron coincidencias
                                          significativas
                                        </p>
                                      )}
                                    </div>
                                  </ScrollArea>
                                </CardContent>
                              </Card>

                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="outline"
                                  onClick={() => handleDownload(result, "txt")}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Descargar TXT
                                </Button>
                                <Button
                                  onClick={() => handleDownload(result, "pdf")}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Descargar PDF
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(result, "pdf")}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          PDF
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {results.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">
                No hay resultados disponibles
              </h3>
              <p className="text-sm text-muted-foreground">
                Sube documentos y ejecuta un análisis para ver los resultados
                aquí.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
