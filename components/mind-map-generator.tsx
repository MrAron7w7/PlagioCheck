"use client";

import { useState, useCallback, useRef } from "react";
// Agrega esta importación
import { toPng } from "html-to-image";
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  NodeTypes,
  Panel,
} from "reactflow";
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
  Network,
  Loader2,
  CheckCircle,
  Sparkles,
  Copy,
  RefreshCw,
  Palette,
  ImageIcon,
} from "lucide-react";
import { geminiDetector } from "@/lib/gemini-client";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import "reactflow/dist/style.css";

// Tipos personalizados para nodos
interface CustomNodeData {
  label: string;
  color: string;
  type: "main" | "sub";
}

interface MindMapNode {
  title: string;
  subIdeas: string[];
  color: string;
}

interface MindMapData {
  title: string;
  mainIdeas: MindMapNode[];
}

// Componentes personalizados de nodo
const CustomMainNode = ({ data }: { data: CustomNodeData }) => (
  <div
    className="px-4 py-2 rounded-full shadow-md border-2 border-white flex items-center justify-center"
    style={{ backgroundColor: data.color, minWidth: "120px" }}
  >
    <div className="font-bold text-center text-white text-sm">{data.label}</div>
  </div>
);

const CustomSubNode = ({ data }: { data: CustomNodeData }) => (
  <div
    className="px-3 py-1 rounded-lg shadow-md border-2 border-white flex items-center justify-center"
    style={{ backgroundColor: data.color }}
  >
    <div className="text-center text-white text-xs">{data.label}</div>
  </div>
);

// Mapeo de tipos de nodo
const nodeTypes: NodeTypes = {
  main: CustomMainNode,
  sub: CustomSubNode,
};

// Paletas de colores predefinidas (colores simples para evitar problemas con html2canvas)
const colorPalettes = [
  ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
  ["#6366F1", "#EC4899", "#14B8A6", "#F97316", "#84CC16"],
  ["#2563EB", "#059669", "#D97706", "#DC2626", "#7C3AED"],
  ["#1D4ED8", "#047857", "#B45309", "#B91C1C", "#6D28D9"],
  ["#1E40AF", "#065F46", "#92400E", "#991B1B", "#5B21B6"],
];

export function MindMapGenerator() {
  const [text, setText] = useState("");
  const [mindMap, setMindMap] = useState<MindMapData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [currentPalette, setCurrentPalette] = useState(0);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Estados de React Flow
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Función para generar un estilo aleatorio
  const generateRandomStyle = () => {
    return Math.floor(Math.random() * colorPalettes.length);
  };

  // Convertir datos del mapa mental a nodos y bordes de React Flow
  const convertToFlowElements = useCallback(
    (data: MindMapData, paletteIndex: number) => {
      const palette = colorPalettes[paletteIndex];
      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];

      // Nodo central
      const centerNode: Node = {
        id: "center",
        type: "main",
        position: { x: 400, y: 300 },
        data: { label: data.title, color: palette[0], type: "main" },
      };
      newNodes.push(centerNode);

      // Nodos principales
      data.mainIdeas.forEach((idea, i) => {
        const angle = (i / data.mainIdeas.length) * 2 * Math.PI;
        const distance = 200;
        const x = 400 + distance * Math.cos(angle);
        const y = 300 + distance * Math.sin(angle);

        const mainNode: Node = {
          id: `main-${i}`,
          type: "main",
          position: { x, y },
          data: {
            label: idea.title,
            color: palette[(i % (palette.length - 1)) + 1],
            type: "main",
          },
        };
        newNodes.push(mainNode);

        // Conectar al centro
        newEdges.push({
          id: `edge-center-${i}`,
          source: "center",
          target: `main-${i}`,
          type: "smoothstep",
          style: {
            stroke: palette[(i % (palette.length - 1)) + 1],
            strokeWidth: 2,
          },
        });

        // Subnodos
        idea.subIdeas.forEach((subIdea, j) => {
          const subAngle = (j / idea.subIdeas.length) * 2 * Math.PI;
          const subDistance = 100;
          const subX = x + subDistance * Math.cos(subAngle);
          const subY = y + subDistance * Math.sin(subAngle);

          const subNode: Node = {
            id: `sub-${i}-${j}`,
            type: "sub",
            position: { x: subX, y: subY },
            data: {
              label: subIdea,
              color: `${palette[(i % (palette.length - 1)) + 1]}`,
              type: "sub",
            },
          };
          newNodes.push(subNode);

          // Conectar al nodo principal
          newEdges.push({
            id: `edge-main-${i}-${j}`,
            source: `main-${i}`,
            target: `sub-${i}-${j}`,
            type: "smoothstep",
            style: {
              stroke: palette[(i % (palette.length - 1)) + 1],
              strokeWidth: 2,
            },
          });
        });
      });

      return { nodes: newNodes, edges: newEdges };
    },
    []
  );

  const handleGenerateMindMap = async (regenerate = false) => {
    if (!text.trim() && !regenerate) {
      toast.error("Por favor ingresa un texto para generar el mapa mental");
      return;
    }

    if (regenerate) {
      setIsRegenerating(true);
    } else {
      setIsGenerating(true);
    }

    try {
      const generatedMindMap = await geminiDetector.generateMindMap(text);
      setMindMap(generatedMindMap);

      const paletteIndex = regenerate ? generateRandomStyle() : currentPalette;
      if (!regenerate) setCurrentPalette(paletteIndex);

      const { nodes: flowNodes, edges: flowEdges } = convertToFlowElements(
        generatedMindMap,
        paletteIndex
      );
      setNodes(flowNodes);
      setEdges(flowEdges);

      if (regenerate) {
        toast.success("Mapa mental regenerado con nuevo diseño");
      } else {
        toast.success("Mapa mental generado correctamente");
      }
    } catch (error) {
      console.error("Error generating mind map:", error);
      toast.error("Error al generar el mapa mental. Verifica tu conexión.");
    } finally {
      setIsGenerating(false);
      setIsRegenerating(false);
    }
  };

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Reemplaza la función exportToImage con esta versión mejorada
  const exportToImage = async () => {
    if (!reactFlowWrapper.current) return;

    try {
      // Buscar el elemento que contiene los nodos
      const flowElement = reactFlowWrapper.current.querySelector(
        ".react-flow__renderer"
      );
      if (!flowElement) {
        toast.error("No se pudo encontrar el elemento para exportar");
        return;
      }

      // Usar la función toPng de html-to-image que es más robusta
      const dataUrl = await toPng(flowElement as HTMLElement, {
        backgroundColor: "#ffffff",
        quality: 1.0,
        pixelRatio: 2,
        filter: (node) => {
          // Filtrar elementos que no queremos en la imagen
          if (
            node?.classList?.contains("react-flow__controls") ||
            node?.classList?.contains("react-flow__minimap") ||
            node?.classList?.contains("react-flow__attribution")
          ) {
            return false;
          }
          return true;
        },
      });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `mapa-mental-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Mapa mental exportado como imagen");
    } catch (error) {
      console.error("Error exporting to image:", error);

      // Fallback: intentar con html2canvas pero con colores seguros
      try {
        const flowElement = reactFlowWrapper.current.querySelector(
          ".react-flow__renderer"
        );
        if (!flowElement) return;

        // Forzar colores seguros antes de capturar
        const safeColorsElement = flowElement.cloneNode(true) as HTMLElement;
        safeColorsElement.style.color = "#000000";
        safeColorsElement.style.backgroundColor = "#ffffff";

        // Aplicar colores seguros a todos los nodos
        const nodes = safeColorsElement.querySelectorAll(".react-flow__node");
        nodes.forEach((node) => {
          (node as HTMLElement).style.color = "#000000";
          (node as HTMLElement).style.backgroundColor = "#f0f0f0";
        });

        document.body.appendChild(safeColorsElement);

        const canvas = await html2canvas(safeColorsElement, {
          backgroundColor: "#ffffff",
          scale: 2,
          logging: false,
        });

        document.body.removeChild(safeColorsElement);

        const imageData = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = imageData;
        link.download = `mapa-mental-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Mapa mental exportado como imagen (modo seguro)");
      } catch (fallbackError) {
        console.error("Error en fallback:", fallbackError);
        toast.error("Error al exportar la imagen");
      }
    }
  };

  const copyMindMap = () => {
    if (!mindMap) return;

    let copyText = `${mindMap.title}\n\n`;

    mindMap.mainIdeas.forEach((idea, index) => {
      copyText += `${index + 1}. ${idea.title}\n`;
      idea.subIdeas.forEach((subIdea) => {
        copyText += `   • ${subIdea}\n`;
      });
      copyText += "\n";
    });

    navigator.clipboard.writeText(copyText);
    toast.info("Mapa mental copiado al portapapeles");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Crear Mapa Mental
          </CardTitle>
          <CardDescription>
            Pega tu texto y la IA generará un mapa mental con las ideas
            principales y secundarias
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Texto a Analizar
            </label>
            <Textarea
              placeholder="Pega aquí tu ensayo, artículo o texto para generar un mapa mental automático..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-40"
            />
            <p className="text-xs text-muted-foreground mt-1">
              La IA identificará las ideas principales y las organizará en un
              esquema visual
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => handleGenerateMindMap(false)}
              disabled={isGenerating || !text.trim()}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generando Mapa Mental...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generar Mapa Mental con IA
                </>
              )}
            </Button>

            {mindMap && (
              <Button
                onClick={() => handleGenerateMindMap(true)}
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

      {mindMap && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Mapa Mental Generado
                  <Badge
                    variant="outline"
                    className="ml-2 flex items-center gap-1"
                  >
                    <Palette className="h-3 w-3" />
                    Paleta {currentPalette + 1}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Esquema visual de las ideas principales y secundarias
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={copyMindMap}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
                <Button variant="outline" onClick={exportToImage}>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Descargar
                </Button>

                <Button
                  onClick={() => handleGenerateMindMap(true)}
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
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Visualización con React Flow */}
              <div
                ref={reactFlowWrapper}
                className="border rounded-lg overflow-hidden bg-gray-50"
                style={{ height: "500px" }}
              >
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  nodeTypes={nodeTypes}
                  fitView
                  attributionPosition="bottom-left"
                >
                  <Controls />
                  <MiniMap
                    nodeColor={(n) => {
                      const nodeData = n.data as CustomNodeData;
                      return nodeData.color;
                    }}
                    position="bottom-right"
                  />
                  <Background color="#aaa" gap={16} />

                  <Panel
                    position="top-right"
                    className="flex gap-2 bg-background/80 p-2 rounded shadow"
                  >
                    <Button
                      onClick={() => {
                        const newPalette = generateRandomStyle();
                        setCurrentPalette(newPalette);
                        const { nodes: newNodes, edges: newEdges } =
                          convertToFlowElements(mindMap, newPalette);
                        setNodes(newNodes);
                        setEdges(newEdges);
                      }}
                      size="sm"
                      variant="outline"
                      title="Cambiar paleta de colores"
                    >
                      <Palette className="h-4 w-4" />
                    </Button>
                  </Panel>
                </ReactFlow>
              </div>
            </div>

            <Alert className="mt-4">
              <Network className="h-4 w-4" />
              <AlertDescription>
                <strong>Tip:</strong> Este mapa mental es generado
                automáticamente por IA. Puedes interactuar con los nodos
                (arrastrar, hacer zoom) y usar el botón de regenerar para
                obtener un diseño diferente con otras formas y colores.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {!mindMap && !isGenerating && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Crea tu primer mapa mental</h3>
              <p className="text-sm text-muted-foreground">
                Pega un texto y la IA organizará las ideas en un esquema visual
                fácil de entender
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
