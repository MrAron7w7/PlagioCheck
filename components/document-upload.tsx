"use client";

import type React from "react";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Brain,
} from "lucide-react";
import { geminiDetector, type PlagiarismResult } from "@/lib/gemini-client";
import { extractTextFromPDF } from "@/lib/pdf-extractor";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: "uploading" | "uploaded" | "error";
  file?: File;
  extractedText?: string;
}

interface DocumentUploadProps {
  onAnalysisComplete?: (result: PlagiarismResult) => void;
  onNavigateToResults?: () => void;
}

export function DocumentUpload({
  onAnalysisComplete,
  onNavigateToResults,
}: DocumentUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState("");

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = async (fileList: File[]) => {
    const pdfFiles = fileList.filter((file) => file.type === "application/pdf");

    if (pdfFiles.length !== fileList.length) {
      // Show warning for non-PDF files
    }

    const newFiles: UploadedFile[] = pdfFiles.map((file) => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      status: "uploading",
      file, // Store the actual file for analysis
    }));

    setFiles((prev) => [...prev, ...newFiles]);

    for (const file of newFiles) {
      try {
        const extractedText = await extractTextFromPDF(file.file!);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "uploaded", extractedText } : f
          )
        );
      } catch (error) {
        console.error("Error extracting text from PDF:", error);
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, status: "error" } : f))
        );
      }
    }
  };

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const handleAnalyze = async () => {
    if (files.length < 2) {
      return;
    }

    const uploadedFiles = files.filter(
      (f) => f.status === "uploaded" && f.extractedText
    );
    if (uploadedFiles.length < 2) {
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      const stages = [
        "Preparando documentos para análisis...",
        "Enviando a Gemini AI para procesamiento...",
        "Analizando similitudes con IA avanzada...",
        "Detectando coincidencias y paráfrasis...",
        "Generando reporte detallado...",
      ];

      let currentStage = 0;
      const progressInterval = setInterval(() => {
        setAnalysisProgress((prev) => {
          const newProgress = prev + 12;
          if (newProgress >= 85) {
            clearInterval(progressInterval);
            return 85;
          }

          const stageIndex = Math.floor(newProgress / 17);
          if (stageIndex !== currentStage && stageIndex < stages.length) {
            setAnalysisStage(stages[stageIndex]);
            currentStage = stageIndex;
          }

          return newProgress;
        });
      }, 1200);

      const documents = uploadedFiles.map((file) => ({
        name: file.name,
        content: file.extractedText!,
      }));

      const result = await geminiDetector.analyzePlagiarism(documents);

      const enhancedResult = {
        ...result,
        id: Date.now().toString(),
        documents: documents.map((doc) => doc.name),
        analysisDate: new Date(),
        analysisType: "AI-Powered",
        totalDocuments: documents.length,
      };

      clearInterval(progressInterval);
      setAnalysisProgress(100);
      setAnalysisStage("¡Análisis con IA completado!");

      const existingResults = JSON.parse(
        localStorage.getItem("plagiarism-results") || "[]"
      );
      const updatedResults = [enhancedResult, ...existingResults];
      localStorage.setItem(
        "plagiarism-results",
        JSON.stringify(updatedResults)
      );

      if (onAnalysisComplete) {
        onAnalysisComplete(enhancedResult);
      }

      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisStage("");
        if (onNavigateToResults) {
          onNavigateToResults();
        }
      }, 2000);
    } catch (error) {
      console.error("Error during AI analysis:", error);
      setIsAnalyzing(false);
      setAnalysisProgress(0);
      setAnalysisStage("");
    }
  };

  const uploadedFiles = files.filter((f) => f.status === "uploaded");

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-primary">
                Detección de Plagio con IA Gemini
              </h3>
              <p className="text-sm text-muted-foreground">
                Análisis avanzado con inteligencia artificial que detecta
                similitudes, paráfrasis y reformulaciones
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Subir Documentos PDF
          </CardTitle>
          <CardDescription>
            Arrastra y suelta tus archivos PDF aquí o haz clic para
            seleccionarlos. Necesitas al menos 2 documentos para realizar la
            comparación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-medium">
                  {isDragging
                    ? "Suelta los archivos aquí"
                    : "Arrastra tus archivos PDF aquí"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  o haz clic para seleccionar archivos
                </p>
              </div>
              <input
                type="file"
                multiple
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <Button asChild variant="outline">
                <label htmlFor="file-upload" className="cursor-pointer">
                  Seleccionar Archivos
                </label>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Archivos Cargados ({files.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                    {file.status === "uploading" && (
                      <Progress value={75} className="mt-2 h-1" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {file.status === "uploading" && (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    )}
                    {file.status === "uploaded" && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    {file.status === "error" && (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(file.id)}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {uploadedFiles.length >= 2 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div>
                <h3 className="font-semibold flex items-center justify-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Listo para Análisis con IA
                </h3>
                <p className="text-sm text-muted-foreground">
                  {uploadedFiles.length} documentos listos para análisis
                  avanzado con Gemini AI
                </p>
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full max-w-xs"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analizando con IA...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Analizar con Gemini AI
                  </>
                )}
              </Button>
              {isAnalyzing && (
                <div className="space-y-2">
                  <Progress
                    value={analysisProgress}
                    className="w-full max-w-xs mx-auto"
                  />
                  <Alert>
                    <Brain className="h-4 w-4" />
                    <AlertDescription>
                      {analysisStage ||
                        `Procesando con IA... ${analysisProgress}%`}
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {uploadedFiles.length === 1 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Necesitas subir al menos 2 documentos para realizar la comparación
            de plagio.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
