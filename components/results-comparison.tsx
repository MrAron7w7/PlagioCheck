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

  const handleDownload = (result: PlagiarismResult) => {
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
  };

  // Calculate summary stats
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
                          <DialogContent className="max-w-4xl max-h-[80vh]">
                            <DialogHeader>
                              <DialogTitle>Detalles de Comparación</DialogTitle>
                              <DialogDescription>
                                Análisis detallado de similitudes entre{" "}
                                {result.documentA} y {result.documentB}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">Resumen</h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span>Similitud:</span>
                                      <span className="font-bold">
                                        {result.similarity}%
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Coincidencias:</span>
                                      <span>{result.totalMatches}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Fecha:</span>
                                      <span>
                                        {new Date(
                                          result.date
                                        ).toLocaleDateString("es-ES")}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">
                                    Nivel de Riesgo
                                  </h4>
                                  <Badge
                                    className={getSimilarityColor(
                                      result.similarity
                                    )}
                                  >
                                    {getSimilarityIcon(result.similarity)}
                                    <span className="ml-1">
                                      {getSimilarityLabel(result.similarity)}
                                    </span>
                                  </Badge>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">
                                  Textos Similares Detectados
                                </h4>
                                <ScrollArea className="h-64 border rounded-lg p-4">
                                  <div className="space-y-3">
                                    {result.matches.length > 0 ? (
                                      result.matches.map((match, index) => (
                                        <div
                                          key={index}
                                          className="p-3 bg-muted rounded-lg"
                                        >
                                          <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium">
                                              Coincidencia #{index + 1}
                                            </span>
                                            <Badge variant="secondary">
                                              {Math.round(
                                                match.similarity * 100
                                              )}
                                              % similar
                                            </Badge>
                                          </div>
                                          <p className="text-sm text-muted-foreground italic">
                                            {match.text}
                                          </p>
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
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(result)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Descargar
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
