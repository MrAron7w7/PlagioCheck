"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Settings,
  Clock,
  MousePointer2,
  Palette,
  Download,
} from "lucide-react";
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

// Paletas de colores expandidas y mejoradas
const colorPalettes = [
  {
    name: "Océano Profesional",
    primary: "#0F172A",
    secondary: "#334155",
    accent: "#3B82F6",
    highlight: "#60A5FA",
    background: "bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100",
    textLight: "#F8FAFC",
    textDark: "#0F172A",
  },
  {
    name: "Esmeralda Corporativa",
    primary: "#064E3B",
    secondary: "#065F46",
    accent: "#10B981",
    highlight: "#34D399",
    background: "bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50",
    textLight: "#F0FDF4",
    textDark: "#064E3B",
  },
  {
    name: "Ámbar Ejecutivo",
    primary: "#78350F",
    secondary: "#92400E",
    accent: "#F59E0B",
    highlight: "#FBBF24",
    background: "bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50",
    textLight: "#FFFBEB",
    textDark: "#78350F",
  },
  {
    name: "Púrpura Innovador",
    primary: "#581C87",
    secondary: "#6B21A8",
    accent: "#8B5CF6",
    highlight: "#A78BFA",
    background: "bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100",
    textLight: "#FAF5FF",
    textDark: "#581C87",
  },
  {
    name: "Rosa Creativo",
    primary: "#831843",
    secondary: "#9D174D",
    accent: "#EC4899",
    highlight: "#F472B6",
    background: "bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100",
    textLight: "#FDF2F8",
    textDark: "#831843",
  },
];

const slideAnimations = [
  "slide-in-right",
  "fade-in",
  "scale-in",
  "slide-up",
  "flip-in",
];

export default function PresentationViewer() {
  const [presentation, setPresentation] = useState<PresentationData | null>(
    null
  );
  const [currentDesign, setCurrentDesign] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [autoPlayInterval, setAutoPlayInterval] = useState(5000);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [slideAnimation, setSlideAnimation] = useState("fade-in");
  const [showPointer, setShowPointer] = useState(false);
  const [pointerPosition, setPointerPosition] = useState({ x: 0, y: 0 });
  const [isDownloading, setIsDownloading] = useState(false);
  const router = useRouter();
  const slideRef = useRef<HTMLDivElement>(null);

  // Mock data para demo
  const mockPresentation: PresentationData = {
    title: "Estrategia Digital 2025",
    slides: [
      {
        title: "Estrategia Digital 2025",
        content: [
          "Transformando el futuro de nuestro negocio",
          "Innovación • Crecimiento • Excelencia",
        ],
        type: "title",
        speakerNotes:
          "Bienvenidos a nuestra presentación sobre la estrategia digital para 2025.",
      },
      {
        title: "Objetivos Estratégicos",
        content: [
          "Aumentar la presencia digital en un 150%",
          "Implementar tecnologías de IA y automatización",
          "Mejorar la experiencia del cliente",
          "Expandir a nuevos mercados digitales",
        ],
        type: "content",
        speakerNotes:
          "Estos son nuestros cuatro pilares fundamentales para el próximo año.",
      },
      {
        title: "Roadmap de Implementación",
        content: [
          "Q1: Análisis y planificación detallada",
          "Q2: Desarrollo de plataformas core",
          "Q3: Lanzamiento y optimización",
          "Q4: Expansión y escalamiento",
        ],
        type: "timeline",
        speakerNotes:
          "Nuestro plan se ejecutará en cuatro fases claramente definidas.",
      },
      {
        title: "Resultados Esperados",
        content: [
          "ROI proyectado del 300% en 18 meses",
          "Reducción de costos operativos del 25%",
          "Aumento de satisfacción del cliente al 95%",
          "Posicionamiento como líder del mercado",
        ],
        type: "results",
        speakerNotes:
          "Los beneficios esperados justifican completamente la inversión.",
      },
      {
        title: "¡Gracias por su Atención!",
        content: ["¿Preguntas?", "Contacto: estrategia@empresa.com"],
        type: "closing",
        speakerNotes: "Momento para preguntas y discusión.",
      },
    ],
  };

  useEffect(() => {
    // Usar datos mock o de sessionStorage
    const savedPresentation = sessionStorage.getItem("currentPresentation");
    const savedDesign = sessionStorage.getItem("currentDesign");

    if (savedPresentation) {
      setPresentation(JSON.parse(savedPresentation));
    } else {
      setPresentation(mockPresentation);
    }

    if (savedDesign) {
      setCurrentDesign(parseInt(savedDesign));
    }

    setStartTime(new Date());

    // Event listeners para teclado
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case " ":
          e.preventDefault();
          nextSlide();
          break;
        case "ArrowLeft":
          e.preventDefault();
          prevSlide();
          break;
        case "Escape":
          handleClose();
          break;
        case "f":
        case "F11":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "p":
          e.preventDefault();
          setIsAutoPlay(!isAutoPlay);
          break;
        case "r":
          e.preventDefault();
          setCurrentSlide(0);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Timer para autoplay
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPlay && presentation) {
      interval = setInterval(() => {
        setCurrentSlide((prev) =>
          prev < presentation.slides.length - 1 ? prev + 1 : 0
        );
      }, autoPlayInterval);
    }
    return () => clearInterval(interval);
  }, [isAutoPlay, autoPlayInterval, presentation]);

  // Timer para tiempo transcurrido
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (startTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime.getTime());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime]);

  const nextSlide = useCallback(() => {
    if (presentation && currentSlide < presentation.slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  }, [currentSlide, presentation]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  }, [currentSlide]);

  const handleClose = () => {
    if (isFullscreen) {
      document.exitFullscreen();
    }
    router.back();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (showPointer) {
      setPointerPosition({ x: e.clientX, y: e.clientY });
    }
  };

  // Función para descargar la presentación como PDF
  const downloadPDF = async () => {
    if (!presentation || isDownloading) return;

    setIsDownloading(true);

    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [window.innerWidth, window.innerHeight],
      });

      // Guardar el estado actual
      const originalSlide = currentSlide;
      const originalSettings = showSettings;

      // Ocultar configuraciones durante la captura
      setShowSettings(false);

      // Esperar a que se actualice el DOM
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Capturar cada slide
      for (let i = 0; i < presentation.slides.length; i++) {
        setCurrentSlide(i);

        // Esperar a que se renderice la slide
        await new Promise((resolve) => setTimeout(resolve, 300));

        if (slideRef.current) {
          const canvas = await html2canvas(slideRef.current, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
          });

          const imgData = canvas.toDataURL("image/png");

          if (i > 0) {
            pdf.addPage();
          }

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
      }

      // Restaurar el estado original
      setCurrentSlide(originalSlide);
      setShowSettings(originalSettings);

      // Descargar el PDF
      pdf.save(`${presentation.title.replace(/\s+/g, "_")}.pdf`);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!presentation) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center text-white">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-4">Cargando presentación...</h2>
          <Button onClick={handleClose} variant="outline">
            Volver
          </Button>
        </div>
      </div>
    );
  }

  const slide = presentation.slides[currentSlide];
  const palette = colorPalettes[currentDesign];

  return (
    <div
      className="fixed inset-0 bg-black flex flex-col overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Puntero personalizado */}
      {showPointer && (
        <div
          className="fixed pointer-events-none z-50 transition-all duration-100"
          style={{
            left: pointerPosition.x - 12,
            top: pointerPosition.y - 12,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="w-6 h-6 rounded-full bg-red-500 opacity-80 animate-pulse"></div>
        </div>
      )}

      {/* Header mejorado */}
      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg">
        <div className="flex items-center gap-6">
          <div>
            <span className="font-bold text-lg">{presentation.title}</span>
            <div className="text-sm text-gray-300 flex items-center gap-4">
              <span>
                Diapositiva {currentSlide + 1} de {presentation.slides.length}
              </span>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatTime(elapsedTime)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controles del header */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className="text-white hover:bg-gray-700"
            title={isAutoPlay ? "Pausar autoplay" : "Iniciar autoplay"}
          >
            {isAutoPlay ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentSlide(0)}
            className="text-white hover:bg-gray-700"
            title="Reiniciar presentación"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPointer(!showPointer)}
            className="text-white hover:bg-gray-700"
            title="Mostrar/ocultar puntero"
          >
            <MousePointer2 className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="text-white hover:bg-gray-700"
            title="Pantalla completa"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={downloadPDF}
            disabled={isDownloading}
            className="text-white hover:bg-gray-700"
            title="Descargar PDF"
          >
            {isDownloading ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="text-white hover:bg-gray-700"
            title="Configuración"
          >
            <Settings className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-white hover:bg-red-600"
            title="Cerrar presentación"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Panel de configuración */}
      {showSettings && (
        <div className="absolute top-16 right-4 bg-white rounded-lg shadow-2xl p-4 z-40 w-80">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Configuración
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Tema de Color
              </label>
              <div className="grid grid-cols-2 gap-2">
                {colorPalettes.map((theme, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentDesign(index)}
                    className={`p-2 rounded text-xs text-left border-2 transition-all ${
                      currentDesign === index
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: theme.accent }}
                      ></div>
                      <span className="font-medium">{theme.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Velocidad Autoplay: {autoPlayInterval / 1000}s
              </label>
              <input
                type="range"
                min="2000"
                max="10000"
                step="1000"
                value={autoPlayInterval}
                onChange={(e) => setAutoPlayInterval(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Animación de Diapositivas
              </label>
              <select
                value={slideAnimation}
                onChange={(e) => setSlideAnimation(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="slide-in-right">Deslizar derecha</option>
                <option value="fade-in">Fundido</option>
                <option value="scale-in">Escala</option>
                <option value="slide-up">Deslizar arriba</option>
                <option value="flip-in">Volteo</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Contenido de la diapositiva mejorado */}
      <div
        ref={slideRef}
        className={`flex-1 flex ${palette.background} p-12 relative overflow-hidden`}
      >
        {/* Elementos decorativos de fondo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-10"
            style={{ backgroundColor: palette.accent }}
          ></div>
          <div
            className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full opacity-5"
            style={{ backgroundColor: palette.highlight }}
          ></div>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center relative z-10">
          <div className={`text-center max-w-5xl animate-${slideAnimation}`}>
            {/* Título de la diapositiva */}
            <h1
              className="font-bold mb-12 drop-shadow-sm transition-all duration-500"
              style={{
                color: palette.primary,
                fontSize: slide.type === "title" ? "4rem" : "3.5rem",
                lineHeight: "1.1",
                textShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              {slide.title}
            </h1>

            {/* Contenido de la diapositiva */}
            <div className="space-y-8">
              {slide.content.map((point, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-6 justify-center transform transition-all duration-500 hover:scale-105`}
                  style={{
                    animationDelay: `${index * 0.2}s`,
                    animation: "slideInLeft 0.8s ease-out forwards",
                  }}
                >
                  {slide.type !== "title" && (
                    <div
                      className="rounded-full flex-shrink-0 mt-4 shadow-lg"
                      style={{
                        width: "20px",
                        height: "20px",
                        backgroundColor: palette.accent,
                        boxShadow: `0 4px 12px ${palette.accent}40`,
                      }}
                    ></div>
                  )}
                  <p
                    className={`text-left leading-relaxed font-medium ${
                      slide.type === "title"
                        ? "text-3xl text-center"
                        : "text-2xl"
                    }`}
                    style={{
                      color:
                        slide.type === "title"
                          ? palette.secondary
                          : palette.primary,
                    }}
                  >
                    {point}
                  </p>
                </div>
              ))}
            </div>

            {/* Notas del speaker (solo visible en modo presentación) */}
            {slide.speakerNotes && showSettings && (
              <div
                className="mt-8 p-4 rounded-lg text-sm text-left max-w-2xl mx-auto"
                style={{
                  backgroundColor: `${palette.accent}10`,
                  color: palette.secondary,
                }}
              >
                <strong>Notas:</strong> {slide.speakerNotes}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="h-1 bg-gray-800">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${
              ((currentSlide + 1) / presentation.slides.length) * 100
            }%`,
            backgroundColor: palette.accent,
          }}
        ></div>
      </div>

      {/* Controles de navegación mejorados */}
      <div className="flex justify-between items-center p-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <Button
          variant="ghost"
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="text-white hover:bg-gray-700 disabled:opacity-30 transition-all"
        >
          <ChevronLeft className="h-5 w-5 mr-2" />
          Anterior
        </Button>

        {/* Indicadores de diapositivas mejorados */}
        <div className="flex items-center gap-3">
          {presentation.slides.map((slideData, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentSlide
                  ? "w-8 h-3 shadow-lg"
                  : "w-3 h-3 hover:scale-125"
              }`}
              style={{
                backgroundColor:
                  index === currentSlide ? palette.accent : "#6B7280",
                boxShadow:
                  index === currentSlide
                    ? `0 0 12px ${palette.accent}60`
                    : "none",
              }}
              title={`Ir a: ${slideData.title}`}
            />
          ))}
        </div>

        <Button
          variant="ghost"
          onClick={nextSlide}
          disabled={currentSlide === presentation.slides.length - 1}
          className="text-white hover:bg-gray-700 disabled:opacity-30 transition-all"
        >
          Siguiente
          <ChevronRight className="h-5 w-5 ml-2" />
        </Button>
      </div>

      {/* Estilos de animación personalizados */}
      <style jsx>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slide-in-right {
          animation: slideInRight 0.5s ease-out;
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-scale-in {
          animation: scaleIn 0.5s ease-out;
        }

        .animate-slide-up {
          animation: slideUp 0.5s ease-out;
        }

        .animate-flip-in {
          animation: flipIn 0.5s ease-out;
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes flipIn {
          from {
            opacity: 0;
            transform: rotateY(-90deg);
          }
          to {
            opacity: 1;
            transform: rotateY(0);
          }
        }
      `}</style>
    </div>
  );
}
