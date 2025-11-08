'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "@/components/Navigation"
import { Footer } from "@/components/Footer"
import { SlideInLeft, SlideInRight, ScaleUp, RotateIn, BounceIn } from "@/components/AnimationVariants"
import { 
  Laptop,
  Settings,
  Shield,
  Code,
  FileText,
  HelpCircle,
  Cloud,
  Database,
  Network,
  Smartphone,
  Server,
  Lock
} from "lucide-react"

export default function ServicesPage() {
  const services = [
    {
      icon: Laptop,
      title: "IT Consulting",
      description: "Expert guidance for your technology needs and strategic IT planning. We help you make informed decisions about your technology infrastructure.",
      features: ["Strategic Planning", "Technology Assessment", "Vendor Selection", "Implementation Support"]
    },
    {
      icon: Settings,
      title: "System Support",
      description: "Comprehensive technical support and maintenance services to keep your systems running smoothly 24/7.",
      features: ["24/7 Monitoring", "Proactive Maintenance", "Troubleshooting", "Performance Optimization"]
    },
    {
      icon: Shield,
      title: "Security Solutions",
      description: "Protect your business with advanced cybersecurity measures and compliance solutions.",
      features: ["Security Audits", "Threat Detection", "Compliance Management", "Incident Response"]
    },
    {
      icon: Code,
      title: "Custom Development",
      description: "Tailored software solutions built to your specifications with modern technologies and best practices.",
      features: ["Web Applications", "Mobile Apps", "API Development", "System Integration"]
    },
    {
      icon: FileText,
      title: "Documentation",
      description: "Clear, comprehensive technical documentation and guides to help your team understand and maintain systems.",
      features: ["Technical Writing", "User Guides", "API Documentation", "Training Materials"]
    },
    {
      icon: HelpCircle,
      title: "Training & Support",
      description: "Empower your team with professional IT training programs and ongoing support.",
      features: ["Technical Training", "Best Practices", "Workshops", "Certification Prep"]
    },
    {
      icon: Cloud,
      title: "Cloud Services",
      description: "Migrate to the cloud and optimize your infrastructure with our cloud expertise.",
      features: ["Cloud Migration", "AWS/Azure/GCP", "Cost Optimization", "Scalability Planning"]
    },
    {
      icon: Database,
      title: "Database Management",
      description: "Optimize and maintain your databases for peak performance and reliability.",
      features: ["Database Design", "Performance Tuning", "Backup & Recovery", "Data Migration"]
    },
    {
      icon: Network,
      title: "Network Solutions",
      description: "Design, implement, and maintain robust network infrastructure for your business.",
      features: ["Network Design", "Security Configuration", "Troubleshooting", "Performance Monitoring"]
    },
    {
      icon: Smartphone,
      title: "Mobile Solutions",
      description: "Develop and maintain mobile applications for iOS and Android platforms.",
      features: ["Native Development", "Cross-Platform", "App Maintenance", "UI/UX Design"]
    },
    {
      icon: Server,
      title: "Infrastructure Management",
      description: "Manage and optimize your server infrastructure for maximum efficiency and uptime.",
      features: ["Server Setup", "Configuration Management", "Monitoring", "Disaster Recovery"]
    },
    {
      icon: Lock,
      title: "Data Protection",
      description: "Implement comprehensive data protection and backup strategies.",
      features: ["Backup Solutions", "Data Encryption", "Recovery Planning", "Compliance"]
    },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-[var(--background)]">
      <Navigation />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-[var(--primary)]/5 via-white to-white dark:from-[var(--primary)]/10 dark:via-[var(--background)] dark:to-[var(--background)] py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-6">
            <ScaleUp delay={0}>
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--foreground)] mb-6 leading-tight">
                  Our Services
                </h1>
                <p className="text-xl md:text-2xl text-[var(--foreground)]/70 leading-relaxed">
                  Comprehensive IT solutions tailored to your business needs. From consulting to implementation, we've got you covered.
                </p>
              </div>
            </ScaleUp>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16 lg:py-24 bg-white dark:bg-[var(--background)]">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {services.map((service, index) => {
                const Icon = service.icon
                // Alternate between different animation types
                const animationType = index % 4
                const AnimationComponent = 
                  animationType === 0 ? SlideInLeft :
                  animationType === 1 ? SlideInRight :
                  animationType === 2 ? RotateIn :
                  BounceIn
                
                return (
                  <AnimationComponent key={index} delay={index * 50}>
                    <Card className="border border-[var(--border)] hover:shadow-xl transition-all duration-300 hover:scale-105 h-full group">
                      <CardHeader>
                        <div className="w-14 h-14 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-[var(--primary)]/20 group-hover:scale-110 group-hover:rotate-6">
                          <Icon className="w-7 h-7 text-[var(--primary)] transition-transform duration-300 group-hover:scale-110" />
                        </div>
                        <CardTitle className="text-xl mb-3 group-hover:text-[var(--primary)] transition-colors duration-300">{service.title}</CardTitle>
                        <CardDescription className="text-base mb-4">
                          {service.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {service.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center text-sm text-[var(--foreground)]/70">
                              <div className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full mr-2" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </AnimationComponent>
                )
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

