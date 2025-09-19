"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText,
  Loader2,
  CheckCircle,
  Sparkles,
  Download,
  Copy,
  BookOpen,
} from "lucide-react";
import { geminiDetector } from "@/lib/gemini-client";
import { toast } from "sonner";
export function AcademicSummarizer() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [wordCount, setWordCount] = useState({ original: 0, summary: 0 });

  const handleTextChange = (value: string) => {
    setText(value);
    const words = value
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    setWordCount((prev) => ({ ...prev, original: words.length }));
  };

  const handleGenerateSummary = async () => {
    if (!text.trim()) {
      toast.error("Error\nPor favor ingresa un texto para generar el resumen");
      //   toast({
      //     title: "Error",
      //     description: "Por favor ingresa un texto para generar el resumen",
      //     variant: "destructive",
      //   });
      return;
    }

    setIsGenerating(true);
    try {
      const generatedSummary = await geminiDetector.summarizeText(text);
      setSummary(generatedSummary);

      const summaryWords = generatedSummary
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0);
      setWordCount((prev) => ({ ...prev, summary: summaryWords.length }));

      toast.success(
        "Resumen generado\nSe ha creado tu resumen académico automáticamente"
      );
      //   toast({
      //     title: "Resumen generado",
      //     description: "Se ha creado tu resumen académico automáticamente",
      //   });
    } catch (error) {
      console.error("Error generating summary:", error);
      toast.error("Error\nError al generar el resumen. Verifica tu conexión.");
      //   toast({
      //     title: "Error",
      //     description: "Error al generar el resumen. Verifica tu conexión.",
      //     variant: "destructive",
      //   });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    toast.info("Copiado\nResumen copiado al portapapeles");
    // toast({
    //   title: "Copiado",
    //   description: "Resumen copiado al portapapeles",
    // });
  };

  const downloadSummary = () => {
    const content = `RESUMEN ACADÉMICO\n\nTexto Original (${
      wordCount.original
    } palabras):\n${text}\n\n\nResumen Generado (${
      wordCount.summary
    } palabras):\n${summary}\n\nGenerado por PlagioCheck - ${new Date().toLocaleDateString(
      "es-ES"
    )}`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `resumen-academico-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Descargado\nResumen descargado como archivo de texto");
    // toast({
    //   title: "Descargado",
    //   description: "Resumen descargado como archivo de texto",
    // });
  };

  const getCompressionRatio = () => {
    if (wordCount.original === 0) return 0;
    return Math.round(
      ((wordCount.original - wordCount.summary) / wordCount.original) * 100
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generar Resumen Académico
          </CardTitle>
          <CardDescription>
            Pega tu texto largo y la IA generará un resumen conciso en estilo
            académico formal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Texto a Resumir</label>
              <Badge variant="outline" className="text-xs">
                {wordCount.original} palabras
              </Badge>
            </div>
            <Textarea
              placeholder="Pega aquí tu texto largo, artículo, ensayo o documento que necesitas resumir..."
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              className="min-h-48"
            />
            <p className="text-xs text-muted-foreground mt-1">
              La IA creará un resumen académico manteniendo las ideas
              principales con lenguaje formal
            </p>
          </div>

          <Button
            onClick={handleGenerateSummary}
            disabled={isGenerating || !text.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generando Resumen...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generar Resumen con IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {summary && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Resumen Académico Generado
                </CardTitle>
                <CardDescription>
                  Resumen profesional en estilo académico formal
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
                <Button variant="outline" onClick={downloadSummary}>
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {wordCount.original}
                      </div>
                      <p className="text-sm text-blue-700">
                        Palabras Originales
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {wordCount.summary}
                      </div>
                      <p className="text-sm text-green-700">Palabras Resumen</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {getCompressionRatio()}%
                      </div>
                      <p className="text-sm text-purple-700">Reducción</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Summary Content */}
              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Resumen Académico
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <div className="p-4 bg-background border rounded-lg">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {summary}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Original Text Preview */}
              <Card className="bg-muted/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Texto Original (Fragmento)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-background border rounded-lg">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {text.length > 300
                        ? `${text.substring(0, 300)}...`
                        : text}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Alert className="mt-4">
              <BookOpen className="h-4 w-4" />
              <AlertDescription>
                <strong>Uso académico:</strong> Este resumen está diseñado para
                facilitar el estudio y la preparación de presentaciones. Siempre
                revisa el contenido y ajústalo según tus necesidades
                específicas.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {!summary && !isGenerating && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">
                Crea tu primer resumen académico
              </h3>
              <p className="text-sm text-muted-foreground">
                Pega un texto largo y la IA generará un resumen profesional en
                estilo académico
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
