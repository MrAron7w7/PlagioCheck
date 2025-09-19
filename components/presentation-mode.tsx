"use client";

import { useState, useRef } from "react";
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
  Presentation,
  Loader2,
  CheckCircle,
  Sparkles,
  Download,
  Copy,
  ChevronLeft,
  ChevronRight,
  Play,
  RefreshCw,
  ImageIcon,
  FileText,
  ExternalLink,
} from "lucide-react";
import { geminiDetector } from "@/lib/gemini-client";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface SlideData {
  title: string;
  content: string[];
  type: string;
  imagePrompt?: string;
  speakerNotes?: string;
}

interface PresentationData {
  title: string;
  slides: SlideData[];
}

// Paletas de colores para diferentes diseños
const colorPalettes = [
  {
    primary: "#3B82F6",
    secondary: "#BFDBFE",
    accent: "#1D4ED8",
    background: "bg-gradient-to-br from-blue-50 to-blue-100",
  },
  {
    primary: "#10B981",
    secondary: "#A7F3D0",
    accent: "#047857",
    background: "bg-gradient-to-br from-green-50 to-green-100",
  },
  {
    primary: "#F59E0B",
    secondary: "#FDE68A",
    accent: "#B45309",
    background: "bg-gradient-to-br from-amber-50 to-amber-100",
  },
  {
    primary: "#8B5CF6",
    secondary: "#DDD6FE",
    accent: "#6D28D9",
    background: "bg-gradient-to-br from-purple-50 to-purple-100",
  },
];

// Imágenes de placeholder para diferentes tipos de slides
const placeholderImages = {
  title:
    "https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
  content:
    "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
  conclusion:
    "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1168&q=80",
  default:
    "https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
};

export function PresentationMode() {
  const [text, setText] = useState("");
  const [presentation, setPresentation] = useState<PresentationData | null>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentDesign, setCurrentDesign] = useState(0);
  const presentationRef = useRef<HTMLDivElement>(null);

  const handleGeneratePresentation = async (regenerate = false) => {
    if (!text.trim() && !regenerate) {
      toast.error("Por favor ingresa un texto para generar la presentación");
      return;
    }

    if (regenerate) {
      setIsRegenerating(true);
    } else {
      setIsGenerating(true);
    }

    try {
      const generatedPresentation = await geminiDetector.generatePresentation(
        text
      );
      setPresentation(generatedPresentation);
      setCurrentSlide(0);

      if (regenerate) {
        const newDesign = (currentDesign + 1) % colorPalettes.length;
        setCurrentDesign(newDesign);
        toast.success("Presentación regenerada con nuevo diseño");
      } else {
        toast.success(
          `Presentación generada con ${generatedPresentation.slides.length} diapositivas`
        );
      }
    } catch (error) {
      console.error("Error generating presentation:", error);
      toast.error("Error al generar la presentación. Verifica tu conexión.");
    } finally {
      setIsGenerating(false);
      setIsRegenerating(false);
    }
  };

  const nextSlide = () => {
    if (presentation && currentSlide < presentation.slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const exportToPdf = async () => {
    if (!presentationRef.current) return;

    try {
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Crear una diapositiva por página
      for (let i = 0; i < presentation!.slides.length; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        setCurrentSlide(i);

        // Pequeña pausa para que se renderice la diapositiva
        await new Promise((resolve) => setTimeout(resolve, 100));

        const canvas = await html2canvas(presentationRef.current!, {
          useCORS: true,
          scale: 2,
          logging: false,
          backgroundColor: "#ffffff",
        });

        const imgData = canvas.toDataURL("image/png");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = (pdfHeight - imgHeight * ratio) / 2;

        pdf.addImage(
          imgData,
          "PNG",
          imgX,
          imgY,
          imgWidth * ratio,
          imgHeight * ratio
        );
      }

      // Volver a la diapositiva actual
      setCurrentSlide(currentSlide);

      pdf.save(`presentacion-${presentation!.title}-${Date.now()}.pdf`);
      toast.success("Presentación exportada como PDF");
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      toast.error("Error al exportar el PDF");
    }
  };

  const copyPresentation = () => {
    if (!presentation) return;

    let copyText = `${presentation.title}\n\n`;

    presentation.slides.forEach((slide, index) => {
      copyText += `${index + 1}. ${slide.title}\n`;
      slide.content.forEach((point) => {
        copyText += `   • ${point}\n`;
      });
      copyText += "\n";
    });

    navigator.clipboard.writeText(copyText);
    toast.success("Presentación copiada al portapapeles");
  };

  const getSlideImage = (slide: SlideData, index: number) => {
    if (index === 0) return placeholderImages.title;
    if (index === presentation!.slides.length - 1)
      return placeholderImages.conclusion;
    if (slide.type === "content") return placeholderImages.content;
    return placeholderImages.default;
  };

  const openSpectaclePresentation = () => {
    if (!presentation) return;

    // Guardar la presentación en sessionStorage para acceder desde la nueva pestaña
    sessionStorage.setItem("currentPresentation", JSON.stringify(presentation));
    sessionStorage.setItem("currentDesign", currentDesign.toString());

    // Abrir nueva pestaña con la presentación Spectacle
    const newWindow = window.open("/presentation-viewer", "_blank");
    if (newWindow) {
      newWindow.focus();
    } else {
      toast.error(
        "Por favor permite ventanas emergentes para ver la presentación"
      );
    }
  };

  const SlideViewer = () => {
    if (!presentation) return null;

    const slide = presentation.slides[currentSlide];
    const palette = colorPalettes[currentDesign];

    return (
      <div
        ref={presentationRef}
        className={`aspect-video ${palette.background} rounded-lg border flex`}
      >
        <div className="flex-1 p-8 flex flex-col justify-center">
          <div className="text-center space-y-6">
            <h1
              className="font-bold"
              style={{
                color: palette.primary,
                fontSize: "1.75rem",
              }}
            >
              {slide.title}
            </h1>
            <div className="space-y-4">
              {slide.content.map((point, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 justify-center"
                >
                  <div
                    className="rounded-full flex-shrink-0 mt-2"
                    style={{
                      width: "8px",
                      height: "8px",
                      backgroundColor: palette.accent,
                    }}
                  ></div>
                  <p
                    className="text-left leading-relaxed max-w-2xl"
                    style={{
                      color: palette.accent,
                      fontSize: "1rem",
                    }}
                  >
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Imagen de la diapositiva */}
        <div className="w-1/3 p-4 flex items-center justify-center">
          <div className="w-full h-48 rounded-lg overflow-hidden shadow-md border">
            <img
              src={getSlideImage(slide, currentSlide)}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div
              className="text-xs text-center p-2"
              style={{ color: palette.primary }}
            >
              <ImageIcon className="h-3 w-3 inline mr-1" />
              Imagen ilustrativa
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Presentation className="h-5 w-5" />
            Crear Presentación Profesional
          </CardTitle>
          <CardDescription>
            Pega tu documento y la IA creará una presentación completa con
            imágenes, lista para exportar a PDF
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Documento a Convertir
            </label>
            <Textarea
              placeholder="Pega aquí tu trabajo, ensayo o documento que necesitas presentar..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-40"
            />
            <p className="text-xs text-muted-foreground mt-1">
              La IA creará una presentación completa con diapositivas, imágenes
              y diseño profesional
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => handleGeneratePresentation(false)}
              disabled={isGenerating || !text.trim()}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generando Presentación...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generar Presentación con IA
                </>
              )}
            </Button>

            {presentation && (
              <Button
                onClick={() => handleGeneratePresentation(true)}
                disabled={isRegenerating}
                variant="outline"
                title="Regenerar con nuevo diseño"
              >
                {isRegenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {presentation && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Presentación Generada
                  <Badge
                    variant="outline"
                    className="ml-2 flex items-center gap-1"
                  >
                    <FileText className="h-3 w-3" />
                    {presentation.slides.length} diapositivas
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Diseño profesional con imágenes y contenido estructurado
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={openSpectaclePresentation}
                  variant="outline"
                  size="sm"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Vista Completa
                </Button>

                <Button variant="outline" onClick={copyPresentation} size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>

                <Button variant="outline" onClick={exportToPdf} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>

                <Button
                  onClick={() => handleGeneratePresentation(true)}
                  disabled={isRegenerating}
                  variant="outline"
                  size="sm"
                  title="Regenerar con nuevo diseño"
                >
                  {isRegenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Slide Viewer */}
              <SlideViewer />

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={prevSlide}
                  disabled={currentSlide === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>

                <div className="flex items-center gap-2">
                  {presentation.slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentSlide
                          ? "bg-primary"
                          : "bg-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={nextSlide}
                  disabled={currentSlide === presentation.slides.length - 1}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>

              <div className="text-center">
                <span className="text-sm text-muted-foreground">
                  Diapositiva {currentSlide + 1} de {presentation.slides.length}
                </span>
              </div>

              {/* Slide Overview */}
              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Vista General de Diapositivas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {presentation.slides.map((slide, index) => (
                      <Card
                        key={index}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          index === currentSlide ? "ring-2 ring-primary" : ""
                        }`}
                        onClick={() => goToSlide(index)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary">#{index + 1}</Badge>
                            {index === currentSlide && (
                              <Badge variant="default">Actual</Badge>
                            )}
                          </div>
                          <CardTitle className="text-sm">
                            {slide.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-1">
                            {slide.content
                              .slice(0, 3)
                              .map((point, pointIndex) => (
                                <div
                                  key={pointIndex}
                                  className="flex items-start gap-1"
                                >
                                  <div className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></div>
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {point}
                                  </p>
                                </div>
                              ))}
                            {slide.content.length > 3 && (
                              <p className="text-xs text-muted-foreground italic">
                                +{slide.content.length - 3} puntos más...
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Alert className="mt-4">
              <Play className="h-4 w-4" />
              <AlertDescription>
                <strong>Tip para presentar:</strong> Usa las flechas del teclado
                o los botones para navegar entre diapositivas. Haz clic en Vista
                Completa para abrir la presentación en una nueva ventana con
                mejor visualización.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {!presentation && !isGenerating && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Presentation className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">
                Crea tu primera presentación profesional
              </h3>
              <p className="text-sm text-muted-foreground">
                Pega un documento y la IA creará una presentación completa con
                imágenes, lista para exportar a PDF
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
