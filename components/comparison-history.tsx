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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  History,
  Search,
  Eye,
  Download,
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import {
  type PlagiarismResult,
  generateReport,
} from "@/lib/plagiarism-detector";

export function ComparisonHistory() {
  const [history, setHistory] = useState<PlagiarismResult[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResult, setSelectedResult] = useState<PlagiarismResult | null>(
    null
  );

  useEffect(() => {
    const savedResults = localStorage.getItem("plagiarism-results");
    if (savedResults) {
      setHistory(JSON.parse(savedResults));
    }
  }, []);

  const filteredHistory = history.filter(
    (item) =>
      item.documentA.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.documentB.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 70) return "text-red-600 bg-red-50 border-red-200";
    if (similarity >= 40)
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-green-600 bg-green-50 border-green-200";
  };

  const getSimilarityIcon = (similarity: number) => {
    if (similarity >= 70) return <AlertTriangle className="h-3 w-3" />;
    return <CheckCircle className="h-3 w-3" />;
  };

  const getSimilarityLabel = (similarity: number) => {
    if (similarity >= 70) return "Alto";
    if (similarity >= 40) return "Medio";
    return "Bajo";
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
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

  return (
    <div className="space-y-6">
      {/* Header with search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial de Comparaciones
          </CardTitle>
          <CardDescription>
            Revisa todas las comparaciones de plagio realizadas anteriormente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre de documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      <Card>
        <CardContent className="pt-6">
          {filteredHistory.length > 0 ? (
            <div className="space-y-4">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Document names */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{item.documentA}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="ml-6">vs</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{item.documentB}</span>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {formatDate(item.date)} - {formatTime(item.date)}
                          </span>
                        </div>
                        <span>{item.totalMatches} coincidencias</span>
                      </div>
                    </div>

                    {/* Similarity and actions */}
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-lg font-bold">
                          {item.similarity}%
                        </div>
                        <Badge
                          variant="outline"
                          className={`${getSimilarityColor(
                            item.similarity
                          )} text-xs`}
                        >
                          {getSimilarityIcon(item.similarity)}
                          <span className="ml-1">
                            {getSimilarityLabel(item.similarity)}
                          </span>
                        </Badge>
                      </div>

                      <div className="flex flex-col gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedResult(item)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Ver
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh]">
                            <DialogHeader>
                              <DialogTitle>Detalles de Comparación</DialogTitle>
                              <DialogDescription>
                                Análisis detallado de similitudes entre{" "}
                                {item.documentA} y {item.documentB}
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
                                        {item.similarity}%
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Coincidencias:</span>
                                      <span>{item.totalMatches}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Fecha:</span>
                                      <span>{formatDate(item.date)}</span>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">
                                    Nivel de Riesgo
                                  </h4>
                                  <Badge
                                    className={getSimilarityColor(
                                      item.similarity
                                    )}
                                  >
                                    {getSimilarityIcon(item.similarity)}
                                    <span className="ml-1">
                                      {getSimilarityLabel(item.similarity)}{" "}
                                      Riesgo
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
                                    {item.matches.length > 0 ? (
                                      item.matches.map((match, index) => (
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
                                            "{match.text}"
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
                          onClick={() => handleDownload(item)}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Descargar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              {searchTerm ? (
                <>
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">
                    No se encontraron resultados
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    No hay comparaciones que coincidan con "{searchTerm}"
                  </p>
                </>
              ) : (
                <>
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">
                    No hay historial disponible
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Las comparaciones que realices aparecerán aquí
                  </p>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary stats */}
      {filteredHistory.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{filteredHistory.length}</p>
                <p className="text-sm text-muted-foreground">
                  Total Comparaciones
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {
                    filteredHistory.filter((item) => item.similarity >= 70)
                      .length
                  }
                </p>
                <p className="text-sm text-muted-foreground">Alto Riesgo</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {
                    filteredHistory.filter(
                      (item) => item.similarity >= 40 && item.similarity < 70
                    ).length
                  }
                </p>
                <p className="text-sm text-muted-foreground">Riesgo Medio</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {
                    filteredHistory.filter((item) => item.similarity < 40)
                      .length
                  }
                </p>
                <p className="text-sm text-muted-foreground">Bajo Riesgo</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
