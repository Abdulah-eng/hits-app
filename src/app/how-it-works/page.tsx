'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "@/components/Navigation"
import { Footer } from "@/components/Footer"
import { SlideInLeft, SlideInRight, ScaleUp, RotateIn, BounceIn, FlipIn } from "@/components/AnimationVariants"
import { 
  Users,
  Search,
  Calendar,
  Award,
  ArrowRight,
  CheckCircle2
} from "lucide-react"
import Link from "next/link"

export default function HowItWorksPage() {
  const steps = [
    {
      step: "1",
      title: "Sign Up",
      description: "Create your account in minutes. Choose to hire specialists or offer your services. Our simple registration process takes less than 2 minutes.",
      icon: Users,
      details: [
        "Choose your role (Client or Specialist)",
        "Provide basic information",
        "Verify your email address",
        "Complete your profile"
      ]
    },
    {
      step: "2",
      title: "Browse & Connect",
      description: "Explore our network of verified IT specialists or showcase your expertise. Use our advanced search and filtering to find the perfect match.",
      icon: Search,
      details: [
        "Search by skills, experience, or location",
        "View detailed profiles and portfolios",
        "Read reviews and ratings",
        "Compare specialists side-by-side"
      ]
    },
    {
      step: "3",
      title: "Book Appointment",
      description: "Schedule a consultation that fits your timeline through our easy booking system. Choose from available time slots that work for you.",
      icon: Calendar,
      details: [
        "Select your preferred date and time",
        "Choose consultation type (video call, phone, in-person)",
        "Add meeting details and requirements",
        "Receive instant confirmation"
      ]
    },
    {
      step: "4",
      title: "Get Results",
      description: "Work together seamlessly and achieve your IT goals with professional support. Track progress, communicate easily, and get results.",
      icon: Award,
      details: [
        "Collaborate in real-time",
        "Track project milestones",
        "Secure payment processing",
        "Leave reviews and feedback"
      ]
    },
  ]

  const benefits = [
    "Verified professionals with background checks",
    "Secure payment processing with escrow",
    "24/7 customer support",
    "Easy project management tools",
    "Transparent pricing and reviews"
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-[var(--background)]">
      <Navigation />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-[var(--primary)]/5 via-white to-white dark:from-[var(--primary)]/10 dark:via-[var(--background)] dark:to-[var(--background)] py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-6">
            <BounceIn delay={0}>
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--foreground)] mb-6 leading-tight">
                  How It Works
                </h1>
                <p className="text-xl md:text-2xl text-[var(--foreground)]/70 leading-relaxed">
                  Get started in four simple steps. Our streamlined process makes it easy to connect with the right IT specialist.
                </p>
              </div>
            </BounceIn>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-16 lg:py-24 bg-white dark:bg-[var(--background)]">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="space-y-16 lg:space-y-24">
                {steps.map((step, index) => {
                  const Icon = step.icon
                  const isEven = index % 2 === 0
                  const AnimationComponent = isEven ? SlideInLeft : SlideInRight
                  
                  return (
                    <AnimationComponent key={index} delay={index * 150}>
                      <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-8 lg:gap-12`}>
                        {/* Icon and Step Number */}
                        <div className="flex-shrink-0">
                          <div className="relative">
                            <div className="w-32 h-32 bg-[var(--primary)]/10 rounded-full flex items-center justify-center">
                              <div className="w-24 h-24 bg-[var(--primary)] rounded-full flex items-center justify-center">
                                <Icon className="w-12 h-12 text-white" />
                              </div>
                            </div>
                            <div className="absolute -top-2 -right-2 w-12 h-12 bg-[var(--primary)] rounded-full flex items-center justify-center text-white text-xl font-bold">
                              {step.step}
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <Card className="border border-[var(--border)] hover:shadow-lg transition-all duration-300">
                            <CardHeader>
                              <CardTitle className="text-2xl md:text-3xl mb-3">{step.title}</CardTitle>
                              <CardDescription className="text-lg mb-4">
                                {step.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-3">
                                {step.details.map((detail, idx) => (
                                  <li key={idx} className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-[var(--primary)] flex-shrink-0 mt-0.5" />
                                    <span className="text-[var(--foreground)]/70">{detail}</span>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </AnimationComponent>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 lg:py-24 bg-[var(--secondary)]/50 dark:bg-[var(--card)]/30">
          <div className="container mx-auto px-4 lg:px-6">
            <ScaleUp delay={0}>
              <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[var(--foreground)]">
                  Why Choose H.I.T.S.?
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {benefits.map((benefit, index) => {
                    const AnimationComponent = index % 2 === 0 ? RotateIn : BounceIn
                    return (
                      <AnimationComponent key={index} delay={index * 100}>
                        <div className="flex items-start gap-3 p-4 bg-white dark:bg-[var(--card)] rounded-lg border border-[var(--border)] hover:shadow-md transition-all duration-300 hover:scale-105">
                          <CheckCircle2 className="w-6 h-6 text-[var(--primary)] flex-shrink-0 mt-0.5" />
                          <span className="text-[var(--foreground)]">{benefit}</span>
                        </div>
                      </AnimationComponent>
                    )
                  })}
                </div>
              </div>
            </ScaleUp>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24 bg-[var(--primary)] text-white">
          <div className="container mx-auto px-4 lg:px-6">
            <FlipIn delay={0}>
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                  Ready to Get Started?
                </h2>
                <p className="text-xl mb-8 text-white/90">
                  Join thousands of clients and specialists already using H.I.T.S.
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
                    <Link href="/contact">Contact Us</Link>
                  </Button>
                </div>
              </div>
            </FlipIn>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

