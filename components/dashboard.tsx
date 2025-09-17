"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import {
  Shield,
  Upload,
  FileText,
  History,
  Settings,
  LogOut,
  User,
  Menu,
  X,
} from "lucide-react";
import { ResultsComparison } from "@/components/results-comparison";
import { AccountSettings } from "@/components/account-settings";
import type { PlagiarismResult } from "@/lib/plagiarism-detector";
import { DocumentUpload } from "./document-upload";
import { ComparisonHistory } from "./comparison-history";

type ActiveSection = "upload" | "results" | "history" | "settings";

export function Dashboard() {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<ActiveSection>("upload");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: "upload" as const, label: "Subir Documentos", icon: Upload },
    { id: "results" as const, label: "Resultados", icon: FileText },
    { id: "history" as const, label: "Historial", icon: History },
    { id: "settings" as const, label: "Configuración", icon: Settings },
  ];

  const handleAnalysisComplete = (result: PlagiarismResult) => {
    console.log("[v0] Analysis completed:", result);
    // Results will be automatically updated in ResultsComparison component
  };

  const handleNavigateToResults = () => {
    setActiveSection("results");
    setSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "upload":
        return (
          <DocumentUpload
            onAnalysisComplete={handleAnalysisComplete}
            onNavigateToResults={handleNavigateToResults}
          />
        );
      case "results":
        return <ResultsComparison />;
      case "history":
        return <ComparisonHistory />;
      case "settings":
        return <AccountSettings />;
      default:
        return (
          <DocumentUpload
            onAnalysisComplete={handleAnalysisComplete}
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
          </div>

          {/* User info */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </div>

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
                Bienvenido, {user?.name}
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
