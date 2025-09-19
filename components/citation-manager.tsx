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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, BookOpen, Loader2, CheckCircle, Sparkles } from "lucide-react";
import { geminiDetector } from "@/lib/gemini-client";
import { toast } from "sonner";

type CitationStyle = "APA" | "IEEE" | "MLA";

export function CitationManager() {
  const [text, setText] = useState("");
  const [citationStyle, setCitationStyle] = useState<CitationStyle>("APA");
  const [citations, setCitations] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateCitations = async () => {
    if (!text.trim()) {
      toast.error("Error\nPor favor ingresa un texto para generar las citas");
      //   toast({
      //     title: "Error",
      //     description: "Por favor ingresa un texto para generar las citas",
      //     variant: "destructive",
      //   });
      return;
    }

    setIsGenerating(true);
    try {
      const generatedCitations = await geminiDetector.generateCitations(
        text,
        citationStyle
      );
      setCitations(generatedCitations);
      toast.success(
        "Citas generadas\n" +
          `Se generaron ${generatedCitations.length} citas en formato ${citationStyle}`
      );
      //   toast({
      //     title: "Citas generadas",
      //     description: `Se generaron ${generatedCitations.length} citas en formato ${citationStyle}`,
      //   });
    } catch (error) {
      console.error("Error generating citations:", error);
      toast.error("Error al generar las citas. Verifica tu conexión.");
      //   toast({
      //     title: "Error",
      //     description: "Error al generar las citas. Verifica tu conexión.",
      //     variant: "destructive",
      //   });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (citation: string) => {
    navigator.clipboard.writeText(citation);
    toast.info("Copiado\nCita copiada al portapapeles");
    // toast({
    //   title: "Copiado",
    //   description: "Cita copiada al portapapeles",
    // });
  };

  const copyAllCitations = () => {
    const allCitations = citations.join("\n\n");
    navigator.clipboard.writeText(allCitations);
    toast.info("Copiado\nTodas las citas copiadas al portapapeles");
    // toast({
    //   title: "Copiado",
    //   description: "Todas las citas copiadas al portapapeles",
    // });
  };

  const getStyleDescription = (style: CitationStyle) => {
    switch (style) {
      case "APA":
        return "American Psychological Association - Usado en psicología, educación y ciencias sociales";
      case "IEEE":
        return "Institute of Electrical and Electronics Engineers - Usado en ingeniería y tecnología";
      case "MLA":
        return "Modern Language Association - Usado en literatura, artes y humanidades";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Generar Citas Bibliográficas
          </CardTitle>
          <CardDescription>
            Pega tu texto y selecciona el formato de citación para generar
            referencias automáticamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Formato de Citación
            </label>
            <Select
              value={citationStyle}
              onValueChange={(value) =>
                setCitationStyle(value as CitationStyle)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="APA">
                  <div className="flex flex-col">
                    <span className="font-medium">APA</span>
                    <span className="text-xs text-muted-foreground">
                      American Psychological Association
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="IEEE">
                  <div className="flex flex-col">
                    <span className="font-medium">IEEE</span>
                    <span className="text-xs text-muted-foreground">
                      Institute of Electrical and Electronics Engineers
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="MLA">
                  <div className="flex flex-col">
                    <span className="font-medium">MLA</span>
                    <span className="text-xs text-muted-foreground">
                      Modern Language Association
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {getStyleDescription(citationStyle)}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Texto a Analizar
            </label>
            <Textarea
              placeholder="Pega aquí el texto que contiene las fuentes que necesitas citar..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-32"
            />
            <p className="text-xs text-muted-foreground mt-1">
              La IA analizará el texto y generará las citas apropiadas para las
              fuentes mencionadas
            </p>
          </div>

          <Button
            onClick={handleGenerateCitations}
            disabled={isGenerating || !text.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generando Citas...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generar Citas con IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {citations.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Citas Generadas ({citations.length})
                </CardTitle>
                <CardDescription>
                  Citas en formato {citationStyle} generadas automáticamente
                </CardDescription>
              </div>
              <Button variant="outline" onClick={copyAllCitations}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar Todas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {citations.map((citation, index) => (
                <div key={index} className="p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">Cita #{index + 1}</Badge>
                        <Badge variant="outline">{citationStyle}</Badge>
                      </div>
                      <p className="text-sm leading-relaxed font-mono bg-background p-3 rounded border">
                        {citation}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(citation)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Alert className="mt-4">
              <BookOpen className="h-4 w-4" />
              <AlertDescription>
                <strong>Importante:</strong> Estas citas son generadas
                automáticamente por IA. Siempre verifica y ajusta las citas
                según las normas específicas de tu institución y los detalles
                exactos de las fuentes.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {citations.length === 0 && !isGenerating && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Genera tus primeras citas</h3>
              <p className="text-sm text-muted-foreground">
                Pega un texto que contenga referencias y selecciona el formato
                de citación para comenzar
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
