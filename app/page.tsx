"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Shield,
  FileText,
  BarChart3,
  Brain,
  Download,
  Upload,
  CheckCircle,
  Users,
  Zap,
  Lock,
  Star,
  Check,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("detector");

  const features = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Detección Avanzada",
      description:
        "Algoritmos IA para detectar similitudes con precisión milimétrica",
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "Análisis Inteligente",
      description: "Gemini AI analiza patrones y contextos complejos",
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Reportes Profesionales",
      description: "Genera reportes detallados en PDF y HTML",
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Métricas Detalladas",
      description: "Estadísticas completas y visualizaciones claras",
    },
  ];

  const pricingPlans = [
    {
      name: "Básico",
      price: "$9.99",
      period: "mes",
      features: [
        "Hasta 50 documentos/mes",
        "Detección básica de plagio",
        "Reportes en HTML",
        "Soporte por email",
      ],
      popular: false,
    },
    {
      name: "Profesional",
      price: "$19.99",
      period: "mes",
      features: [
        "Documentos ilimitados",
        "Detección avanzada con IA",
        "Reportes PDF profesionales",
        "Herramientas académicas",
        "Soporte prioritario",
      ],
      popular: true,
    },
    {
      name: "Institucional",
      price: "$49.99",
      period: "mes",
      features: [
        "Múltiples usuarios",
        "API acceso",
        "Personalización",
        "Analíticas avanzadas",
        "Soporte 24/7",
      ],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-primary p-2 rounded-lg">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">
                PlagioCheck
              </span>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-muted-foreground hover:text-foreground font-medium transition-colors"
              >
                Características
              </a>

              <a
                href="#pricing"
                className="text-muted-foreground hover:text-foreground font-medium transition-colors"
              >
                Precios
              </a>
            </nav>

            <div className="flex items-center space-x-4">
              <Link href={"/login"}>
                <Button className="hidden sm:flex">Iniciar Sesión</Button>
              </Link>
              {/* <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Comenzar Gratis
              </Button> */}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
            <Star className="w-3 h-3 mr-1 fill-current" />
            Impulsado por Gemini AI
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Detecta el plagio con
            <span className="text-primary"> precisión de IA</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            La herramienta académica más completa. Detecta similitudes, genera
            citas, crea resúmenes y mucho más con tecnología de inteligencia
            artificial avanzada.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            {/* <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
            >
              <Upload className="mr-2 h-4 w-4" />
              Analizar Documento
            </Button>
            <Button size="lg" variant="outline" className="px-8">
              <FileText className="mr-2 h-4 w-4" />
              Ver Demo
            </Button> */}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">99.8%</div>
              <div className="text-muted-foreground">Precisión</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">50K+</div>
              <div className="text-muted-foreground">Documentos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">2s</div>
              <div className="text-muted-foreground">Análisis</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">100%</div>
              <div className="text-muted-foreground">Confiable</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Todo lo que necesitas en una sola plataforma
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Herramientas académicas integradas con IA para maximizar tu
            productividad y garantizar la originalidad.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="text-center border border-border hover:shadow-md transition-all duration-300"
            >
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <div className="text-primary">{feature.icon}</div>
                </div>
                <CardTitle className="text-xl text-foreground">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tool Interface */}
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="container mx-auto px-4 py-16 bg-muted/30"
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Planes para cada necesidad
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Elige el plan que mejor se adapte a tus requerimientos académicos o
            profesionales
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <Card
              key={index}
              className={`relative border-2 ${
                plan.popular ? "border-primary shadow-md" : "border-border"
              } transition-all hover:shadow-md`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    Más Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl text-foreground">
                  {plan.name}
                </CardTitle>
                <div className="flex items-baseline justify-center space-x-1 mt-4">
                  <span className="text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-2" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  Comenzar Ahora
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      {/* <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Únete a miles de académicos y profesionales que confían en
            PlagioCheck
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="bg-background text-foreground hover:bg-background/90"
            >
              Solicitar Demo
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-background text-background hover:bg-background hover:text-foreground"
            >
              <Upload className="mr-2 h-4 w-4" />
              Comenzar Gratis
            </Button>
          </div>
        </div>
      </section> */}

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="bg-primary p-2 rounded-lg">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">
                PlagioCheck
              </span>
            </div>
            <div className="text-muted-foreground">
              © 2024 PlagioCheck. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
