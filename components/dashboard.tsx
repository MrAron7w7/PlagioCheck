"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import {
  Shield,
  Upload,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
  AlertTriangle,
  BookAudio,
  Map,
  Calendar,
  Presentation,
} from "lucide-react";
import { DocumentUpload } from "@/components/document-upload";
import { ResultsComparison } from "@/components/results-comparison";
import { AccountSettings } from "@/components/account-settings";
import { Card, CardContent } from "@/components/ui/card";
import type { PlagiarismResult } from "@/lib/plagiarism-detector";
import { AcademicSummarizer } from "./academic-summarizer";
import { CitationManager } from "./citation-manager";
import { PresentationMode } from "./presentation-mode";
import { MindMapGenerator } from "./mind-map-generator";

type ActiveSection =
  | "upload"
  | "results"
  | "history"
  | "settings"
  | "sumary"
  | "mind-map"
  | "citation"
  | "presentation";

export function Dashboard() {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<ActiveSection>("upload");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    highRiskCount: 0,
    mediumRiskCount: 0,
    lowRiskCount: 0,
  });

  const menuItems = [
    { id: "upload" as const, label: "Subir Documentos", icon: Upload },
    { id: "results" as const, label: "Resultados", icon: FileText },
    { id: "sumary" as const, label: "Resumen Academico", icon: BookAudio },
    { id: "mind-map" as const, label: "Generarar Mapa", icon: Map },
    {
      id: "citation" as const,
      label: "Manejador de citas academicas",
      icon: Calendar,
    },
    {
      id: "presentation" as const,
      label: "Modo presentación",
      icon: Presentation,
    },
    { id: "settings" as const, label: "Configuración", icon: Settings },
  ];

  useEffect(() => {
    const savedResults = localStorage.getItem("plagiarism-results");
    if (savedResults) {
      const results: PlagiarismResult[] = JSON.parse(savedResults);
      setStats({
        totalAnalyses: results.length,
        highRiskCount: results.filter((r) => r.similarity >= 70).length,
        mediumRiskCount: results.filter(
          (r) => r.similarity >= 40 && r.similarity < 70
        ).length,
        lowRiskCount: results.filter((r) => r.similarity < 40).length,
      });
    }
  }, [activeSection]); // Refresh stats when section changes

  const handleNavigateToResults = () => {
    setActiveSection("results");
    setSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "upload":
        return (
          <div className="space-y-6">
            {stats.totalAnalyses > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {stats.totalAnalyses}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Total Análisis
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                          {stats.highRiskCount}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Alto Riesgo
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                          {stats.mediumRiskCount}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Riesgo Medio
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {stats.lowRiskCount}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Bajo Riesgo
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            <DocumentUpload
              // onAnalysisComplete={handleAnalysisComplete}
              onNavigateToResults={handleNavigateToResults}
            />
          </div>
        );
      case "results":
        return <ResultsComparison />;

      case "sumary":
        return <AcademicSummarizer />;
      case "mind-map":
        return <MindMapGenerator />;
      case "citation":
        return <CitationManager />;
      case "presentation":
        return <PresentationMode />;
      case "settings":
        return <AccountSettings />;

      default:
        return (
          <DocumentUpload
            // onAnalysisComplete={handleAnalysisComplete}
            onNavigateToResults={handleNavigateToResults}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-primary">
                PlagioCheck
              </span>
            </div>
            <div className="mt-2">
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                Pro v2.0
              </span>
            </div>
          </div>

          {/* User info */}
          {/* <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </div> */}

          {stats.totalAnalyses > 0 && (
            <div className="p-4 border-b border-border">
              <div className="text-xs text-muted-foreground mb-2">
                Resumen Rápido
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center p-2 bg-muted rounded">
                  <div className="font-bold text-blue-600">
                    {stats.totalAnalyses}
                  </div>
                  <div className="text-muted-foreground">Total</div>
                </div>
                <div className="text-center p-2 bg-muted rounded">
                  <div className="font-bold text-red-600">
                    {stats.highRiskCount}
                  </div>
                  <div className="text-muted-foreground">Alto</div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setActiveSection(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeSection === item.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              onClick={logout}
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="lg:hidden w-10"></div> {/* Spacer for mobile */}
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {menuItems.find((item) => item.id === activeSection)?.label ||
                  "Dashboard"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {activeSection === "upload" && stats.totalAnalyses > 0
                  ? `Has realizado ${stats.totalAnalyses} análisis hasta ahora`
                  : `Bienvenido, ${user?.name}`}
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>PlagioCheck Pro</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">{renderContent()}</main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
