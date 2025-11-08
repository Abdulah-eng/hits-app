'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "@/components/Navigation"
import { Footer } from "@/components/Footer"
import { SlideInLeft, ScaleUp, RotateIn } from "@/components/AnimationVariants"
import { HeroAnimation, StaggeredItem } from "@/components/HeroAnimation"
import { 
  ArrowRight, 
  Users, 
  CheckCircle2,
  Star,
  HeadphonesIcon,
  Laptop,
  Settings,
  Shield,
  Code,
  FileText,
  HelpCircle
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const services = [
    {
      icon: Laptop,
      title: "IT Consulting",
      description: "Expert guidance for your technology needs and strategic IT planning"
    },
    {
      icon: Settings,
      title: "System Support",
      description: "Comprehensive technical support and maintenance services"
    },
    {
      icon: Shield,
      title: "Security Solutions",
      description: "Protect your business with advanced cybersecurity measures"
    },
    {
      icon: Code,
      title: "Custom Development",
      description: "Tailored software solutions built to your specifications"
    },
    {
      icon: FileText,
      title: "Documentation",
      description: "Clear, comprehensive technical documentation and guides"
    },
    {
      icon: HelpCircle,
      title: "Training & Support",
      description: "Empower your team with professional IT training programs"
    },
  ]

  const stats = [
    { value: "10K+", label: "Active Specialists" },
    { value: "50K+", label: "Projects Completed" },
    { value: "98%", label: "Client Satisfaction" },
    { value: "24/7", label: "Support Available" },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-[var(--background)]">
      <Navigation />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-[var(--primary)]/5 via-white to-white dark:from-[var(--primary)]/10 dark:via-[var(--background)] dark:to-[var(--background)] py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-6">
            <HeroAnimation initialDelay={500}>
              <div className="max-w-4xl mx-auto text-center">
                <StaggeredItem delay={200}>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--foreground)] mb-6 leading-tight">
                    Connect with Top IT Talent
                  </h1>
                </StaggeredItem>
                
                <StaggeredItem delay={400}>
                  <p className="text-xl md:text-2xl text-[var(--foreground)]/70 mb-8 max-w-2xl mx-auto leading-relaxed">
                    Find skilled IT specialists for your projects or offer your expertise to clients worldwide. Secure payments, verified professionals, and seamless collaboration.
                  </p>
                </StaggeredItem>
                
                <StaggeredItem delay={600}>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                    <Button 
                      size="lg" 
                      className="text-lg px-8 py-6 bg-[var(--primary)] hover:bg-[var(--primary)]/90 transition-all duration-300 hover:scale-105" 
                      asChild
                    >
                      <Link href="/auth/sign-up">
                        Get Started
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Link>
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="text-lg px-8 py-6 transition-all duration-300 hover:scale-105" 
                      asChild
                    >
                      <Link href="/services">Learn More</Link>
                    </Button>
                  </div>
                </StaggeredItem>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mt-16">
                  {stats.map((stat, index) => (
                    <StaggeredItem key={index} delay={800 + index * 100}>
                      <div className="text-center">
                        <div className="text-3xl md:text-4xl font-bold text-[var(--primary)] mb-2">
                          {stat.value}
                        </div>
                        <div className="text-sm md:text-base text-[var(--foreground)]/70">
                          {stat.label}
                        </div>
                      </div>
                    </StaggeredItem>
                  ))}
                </div>
              </div>
            </HeroAnimation>
          </div>
        </section>

        {/* Services Preview Section */}
        <section className="py-16 lg:py-24 bg-white dark:bg-[var(--background)]">
          <div className="container mx-auto px-4 lg:px-6">
            <ScaleUp delay={0}>
              <div className="text-center mb-12 lg:mb-16">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--foreground)] mb-4">
                  Our Services
                </h2>
                <p className="text-lg text-[var(--foreground)]/70 max-w-2xl mx-auto">
                  Comprehensive IT solutions tailored to your business needs
                </p>
              </div>
            </ScaleUp>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {services.slice(0, 3).map((service, index) => {
                const Icon = service.icon
                const AnimationComponent = index === 0 ? SlideInLeft : index === 1 ? RotateIn : ScaleUp
                return (
                  <AnimationComponent key={index} delay={index * 100}>
                    <Card className="border border-[var(--border)] hover:shadow-lg transition-all duration-300 hover:scale-105 group">
                      <CardHeader>
                        <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-[var(--primary)]/20 group-hover:scale-110 group-hover:rotate-6">
                          <Icon className="w-6 h-6 text-[var(--primary)] transition-transform duration-300 group-hover:scale-110" />
                        </div>
                        <CardTitle className="text-xl mb-2 group-hover:text-[var(--primary)] transition-colors duration-300">{service.title}</CardTitle>
                        <CardDescription className="text-base">
                          {service.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </AnimationComponent>
                )
              })}
            </div>

            <RotateIn delay={300}>
              <div className="text-center mt-12">
                <Button asChild variant="outline" className="transition-all duration-300 hover:scale-105">
                  <Link href="/services">
                    View All Services
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </RotateIn>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24 bg-[var(--primary)] text-white">
          <div className="container mx-auto px-4 lg:px-6">
            <ScaleUp delay={0}>
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                  Ready to Get Started?
                </h2>
                <p className="text-xl mb-8 text-white/90">
                  Join thousands of clients and specialists already using H.I.T.S. to transform their IT projects
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    className="text-lg px-8 py-6 bg-white text-[var(--primary)] hover:bg-white/90 transition-all duration-300 hover:scale-105" 
                    asChild
                  >
                    <Link href="/auth/sign-up">
                      Create Your Account
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="text-lg px-8 py-6 border-white text-white hover:bg-white/10 transition-all duration-300 hover:scale-105" 
                    asChild
                  >
                    <Link href="/auth/sign-in">Sign In</Link>
                  </Button>
                </div>
              </div>
            </ScaleUp>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
