'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight, 
  Users, 
  Code, 
  Shield, 
  Zap, 
  Clock, 
  CheckCircle2,
  Star,
  TrendingUp,
  Globe,
  HeadphonesIcon,
  Sparkles,
  Search,
  Calendar,
  MessageSquare,
  Award,
  ArrowDown,
  PlayCircle,
  Quote
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState, useRef } from "react"

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set(['hero']))

  useEffect(() => {
    setMounted(true)
    
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    // Intersection Observer for scroll animations
    const observerOptions = {
      root: null,
      rootMargin: '-100px 0px',
      threshold: 0.1
    }
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleSections((prev) => new Set([...prev, entry.target.id]))
        }
      })
    }, observerOptions)
    
    // Observe all sections
    const sections = document.querySelectorAll('[data-section]')
    sections.forEach((section) => observer.observe(section))
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      observer.disconnect()
    }
  }, [])

  const stats = [
    { value: "10K+", label: "Active Specialists", icon: Users, color: "from-blue-500 to-cyan-500" },
    { value: "50K+", label: "Projects Completed", icon: CheckCircle2, color: "from-green-500 to-emerald-500" },
    { value: "98%", label: "Client Satisfaction", icon: Star, color: "from-yellow-500 to-orange-500" },
    { value: "24/7", label: "Support Available", icon: HeadphonesIcon, color: "from-purple-500 to-pink-500" },
  ]

  const features = [
    {
      icon: Users,
      title: "Verified Professionals",
      description: "All specialists undergo rigorous verification with skills assessments, portfolio reviews, and background checks",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Protected transactions with Stripe integration, escrow system, and secure payment processing",
      color: "from-teal-500 to-emerald-500",
    },
    {
      icon: Zap,
      title: "Fast Delivery",
      description: "Quick turnaround times with real-time project tracking, progress updates, and milestone management",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Globe,
      title: "Global Network",
      description: "Connect with IT specialists from around the world, available across multiple time zones",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: TrendingUp,
      title: "Growth Analytics",
      description: "Track your project progress with detailed analytics and insights for better decision making",
      color: "from-indigo-500 to-purple-500",
    },
    {
      icon: Clock,
      title: "Time Tracking",
      description: "Automatic time tracking and reporting for transparent project management and billing",
      color: "from-green-500 to-teal-500",
    },
  ]

  const howItWorks = [
    {
      step: "01",
      title: "Sign Up & Browse",
      description: "Create your account and explore our extensive network of verified IT specialists",
      icon: Search,
      color: "from-blue-500 to-cyan-500"
    },
    {
      step: "02",
      title: "Book Appointment",
      description: "Schedule a consultation with your chosen specialist through our seamless booking system",
      icon: Calendar,
      color: "from-purple-500 to-pink-500"
    },
    {
      step: "03",
      title: "Collaborate",
      description: "Work together with real-time communication, progress tracking, and milestone management",
      icon: MessageSquare,
      color: "from-green-500 to-emerald-500"
    },
    {
      step: "04",
      title: "Get Results",
      description: "Receive high-quality deliverables and leave reviews to help build the community",
      icon: Award,
      color: "from-orange-500 to-yellow-500"
    },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CEO, TechStart Inc",
      content: "H.I.T.S. transformed how we find IT talent. The quality of specialists is unmatched, and the platform makes collaboration effortless.",
      rating: 5,
      avatar: "SJ"
    },
    {
      name: "Michael Chen",
      role: "Freelance Developer",
      content: "As a specialist, I've found incredible opportunities through H.I.T.S. The platform is intuitive, and payments are always secure and on time.",
      rating: 5,
      avatar: "MC"
    },
    {
      name: "Emily Rodriguez",
      role: "Project Manager",
      content: "The verification process gives me confidence in every specialist I work with. It's a game-changer for our IT projects.",
      rating: 5,
      avatar: "ER"
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--secondary)] to-[var(--background)] overflow-x-hidden">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Mesh Gradient Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[var(--primary)]/5 via-transparent to-[var(--accent)]/5" />
        
        {/* Floating Orbs */}
        <div 
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[var(--primary)]/10 rounded-full blur-3xl animate-pulse"
          style={{ transform: `translate(${scrollY * 0.02}px, ${scrollY * 0.03}px)` }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[var(--accent)]/10 rounded-full blur-3xl animate-pulse delay-1000"
          style={{ transform: `translate(${-scrollY * 0.02}px, ${-scrollY * 0.03}px)` }}
        />
        <div 
          className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-[var(--primary)]/5 rounded-full blur-3xl animate-pulse delay-500"
          style={{ transform: `translate(${scrollY * 0.01}px, ${scrollY * 0.02}px)` }}
        />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-50" />
      </div>

      {/* Sticky Header */}
      <header className={`sticky top-0 z-50 transition-all duration-500 ${scrollY > 50 ? 'backdrop-blur-xl bg-white/90 dark:bg-[var(--card)]/90 shadow-lg' : 'backdrop-blur-md bg-white/80 dark:bg-[var(--card)]/80'}`}>
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                <Code className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
                H.I.T.S.
              </span>
            </Link>
            <div className="flex space-x-3">
              <Button variant="ghost" asChild className="hidden sm:flex hover:bg-[var(--primary)]/10 transition-all duration-300">
                <Link href="/auth/sign-in">Sign In</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] hover:shadow-xl hover:scale-105 transition-all duration-300">
                <Link href="/auth/sign-up">Get Started</Link>
              </Button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main>
        <section 
          id="hero"
          data-section="hero"
          className={`container mx-auto px-4 py-12 md:py-20 lg:py-28 transition-all duration-1000 ${visibleSections.has('hero') || mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="text-center max-w-5xl mx-auto">
            {/* Animated Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[var(--primary)]/10 to-[var(--accent)]/10 border border-[var(--primary)]/20 backdrop-blur-sm mb-8 animate-fade-in shadow-lg">
              <Sparkles className="w-4 h-4 text-[var(--primary)] animate-spin-slow" />
              <Badge variant="secondary" className="bg-transparent border-0 text-[var(--primary)] font-semibold text-sm">
                Hire I.T. Specialists
              </Badge>
            </div>
            
            {/* Hero Title */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-extrabold mb-8 leading-[1.1]">
              <span className="inline-block bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-[var(--primary)] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                Connect with Top
              </span>
              <br />
              <span className="inline-block bg-gradient-to-r from-[var(--accent)] via-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient mt-2">
                IT Talent
              </span>
            </h1>
            
            {/* Hero Description */}
            <p className="text-xl md:text-2xl lg:text-3xl text-[var(--foreground)]/70 dark:text-[var(--foreground)]/80 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              Find skilled IT specialists for your projects or offer your expertise to clients worldwide. 
              <span className="font-semibold text-[var(--primary)]"> Secure payments</span>, 
              <span className="font-semibold text-[var(--accent)]"> verified professionals</span>, and 
              <span className="font-semibold text-[var(--primary)]"> seamless collaboration</span>.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button 
                size="lg" 
                className="text-lg px-10 py-7 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] hover:shadow-2xl hover:scale-110 transition-all duration-300 group relative overflow-hidden" 
                asChild
              >
                <Link href="/auth/sign-up" className="relative z-10">
                  <span className="relative z-10 flex items-center">
                    Find Specialists
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-10 py-7 border-2 backdrop-blur-sm bg-white/50 dark:bg-[var(--card)]/50 hover:bg-[var(--primary)]/10 hover:border-[var(--primary)] hover:scale-110 hover:shadow-xl transition-all duration-300" 
                asChild
              >
                <Link href="/auth/sign-up">Offer Services</Link>
              </Button>
            </div>

            {/* Scroll Indicator */}
            <div className="flex flex-col items-center gap-2 animate-bounce">
              <span className="text-sm text-[var(--foreground)]/50">Scroll to explore</span>
              <ArrowDown className="w-5 h-5 text-[var(--primary)]" />
            </div>

            {/* Enhanced Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-20">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                const isVisible = visibleSections.has('hero') || mounted
                return (
                  <div
                    key={index}
                    className={`group relative p-6 md:p-8 rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-[var(--card)]/70 border border-[var(--border)]/50 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    style={{ transitionDelay: `${400 + index * 100}ms` }}
                  >
                    {/* Gradient Background on Hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                    
                    <div className="relative z-10">
                      <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${stat.color} mb-4 shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                        <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                      </div>
                      <div className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent mb-2">
                        {stat.value}
                      </div>
                      <div className="text-sm md:text-base text-[var(--foreground)]/70 font-medium">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section 
          id="how-it-works"
          data-section="how-it-works"
          className={`py-20 md:py-28 container mx-auto px-4 transition-all duration-1000 ${visibleSections.has('how-it-works') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--accent)]/10 text-[var(--primary)] border-[var(--primary)]/20">
              How It Works
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
              Get Started in 4 Simple Steps
            </h2>
            <p className="text-lg md:text-xl text-[var(--foreground)]/70 max-w-2xl mx-auto">
              Our streamlined process makes it easy to connect with the right IT specialist
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {howItWorks.map((step, index) => {
              const Icon = step.icon
              const isVisible = visibleSections.has('how-it-works')
              return (
                <div
                  key={index}
                  className={`group relative transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden relative backdrop-blur-xl bg-white/80 dark:bg-[var(--card)]/80">
                    {/* Step Number Background */}
                    <div className="absolute top-0 right-0 w-24 h-24 opacity-5 group-hover:opacity-10 transition-opacity">
                      <div className={`text-8xl font-black bg-gradient-to-br ${step.color} bg-clip-text text-transparent`}>
                        {step.step}
                      </div>
                    </div>
                    
                    <CardHeader className="relative z-10 pb-4">
                      <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${step.color} mb-4 shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 w-fit`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-xl md:text-2xl mb-3 group-hover:text-[var(--primary)] transition-colors duration-300">
                        {step.title}
                      </CardTitle>
                      <CardDescription className="text-base leading-relaxed">
                        {step.description}
                      </CardDescription>
                    </CardHeader>
                    
                    {/* Connecting Line */}
                    {index < howItWorks.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-[var(--primary)] to-transparent opacity-30 group-hover:opacity-60 transition-opacity" />
                    )}
                  </Card>
                </div>
              )
            })}
          </div>
        </section>

        {/* Features Grid */}
        <section 
          id="features"
          data-section="features"
          className={`py-20 md:py-28 container mx-auto px-4 transition-all duration-1000 ${visibleSections.has('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--accent)]/10 text-[var(--primary)] border-[var(--primary)]/20">
              Features
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
              Why Choose H.I.T.S.?
            </h2>
            <p className="text-lg md:text-xl text-[var(--foreground)]/70 max-w-2xl mx-auto">
              Everything you need to connect, collaborate, and succeed with top IT talent
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              const isVisible = visibleSections.has('features')
              return (
                <Card
                  key={index}
                  className={`group border-0 shadow-xl hover:shadow-2xl transition-all duration-700 hover:scale-105 cursor-pointer overflow-hidden relative backdrop-blur-xl bg-white/80 dark:bg-[var(--card)]/80 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  {/* Gradient Background on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  
                  <CardHeader className="relative z-10">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl md:text-2xl mb-3 group-hover:text-[var(--primary)] transition-colors duration-300">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Testimonials Section */}
        <section 
          id="testimonials"
          data-section="testimonials"
          className={`py-20 md:py-28 container mx-auto px-4 transition-all duration-1000 ${visibleSections.has('testimonials') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--accent)]/10 text-[var(--primary)] border-[var(--primary)]/20">
              Testimonials
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
              Trusted by Thousands
            </h2>
            <p className="text-lg md:text-xl text-[var(--foreground)]/70 max-w-2xl mx-auto">
              See what our clients and specialists are saying about H.I.T.S.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => {
              const isVisible = visibleSections.has('testimonials')
              return (
                <Card
                  key={index}
                  className={`group border-0 shadow-xl hover:shadow-2xl transition-all duration-700 hover:scale-105 relative backdrop-blur-xl bg-white/80 dark:bg-[var(--card)]/80 overflow-hidden ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  {/* Quote Icon */}
                  <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Quote className="w-16 h-16 text-[var(--primary)]" />
                  </div>
                  
                  <CardHeader className="relative z-10">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <CardDescription className="text-base leading-relaxed mb-6 min-h-[120px]">
                      "{testimonial.content}"
                    </CardDescription>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-bold shadow-lg">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <CardTitle className="text-lg mb-0">{testimonial.name}</CardTitle>
                        <p className="text-sm text-[var(--foreground)]/60">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section 
          id="cta"
          data-section="cta"
          className={`py-20 md:py-28 container mx-auto px-4 transition-all duration-1000 ${visibleSections.has('cta') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="relative max-w-5xl mx-auto">
            <div className="relative p-12 md:p-20 rounded-3xl backdrop-blur-xl bg-gradient-to-br from-[var(--primary)]/10 via-[var(--accent)]/10 to-[var(--primary)]/10 border-2 border-[var(--primary)]/20 shadow-2xl overflow-hidden">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/5 via-[var(--accent)]/5 to-[var(--primary)]/5 animate-gradient-slow" />
              
              {/* Decorative Elements */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-[var(--primary)]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-[var(--accent)]/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
              
              <div className="relative z-10 text-center">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
                  Ready to Get Started?
                </h2>
                <p className="text-xl md:text-2xl text-[var(--foreground)]/80 mb-10 max-w-2xl mx-auto leading-relaxed">
                  Join thousands of clients and specialists already using H.I.T.S. to transform their IT projects
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    className="text-lg px-10 py-7 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] hover:shadow-2xl hover:scale-110 transition-all duration-300 group relative overflow-hidden" 
                    asChild
                  >
                    <Link href="/auth/sign-up" className="relative z-10">
                      <span className="relative z-10 flex items-center">
                        Create Your Account
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Link>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="text-lg px-10 py-7 border-2 backdrop-blur-sm bg-white/50 dark:bg-[var(--card)]/50 hover:bg-[var(--primary)]/10 hover:border-[var(--primary)] hover:scale-110 transition-all duration-300" 
                    asChild
                  >
                    <Link href="/auth/sign-in">Sign In</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Enhanced Footer */}
      <footer className="border-t border-[var(--border)]/50 backdrop-blur-xl bg-white/60 dark:bg-[var(--card)]/60 mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-xl flex items-center justify-center shadow-lg">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
                  H.I.T.S.
                </span>
              </div>
              <p className="text-sm text-[var(--foreground)]/70">
                Connecting businesses with top IT talent worldwide.
              </p>
            </div>
            
            {/* Links */}
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-[var(--foreground)]/60 hover:text-[var(--primary)] transition-colors">Features</Link></li>
                <li><Link href="#" className="text-[var(--foreground)]/60 hover:text-[var(--primary)] transition-colors">Pricing</Link></li>
                <li><Link href="#" className="text-[var(--foreground)]/60 hover:text-[var(--primary)] transition-colors">How It Works</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-[var(--foreground)]/60 hover:text-[var(--primary)] transition-colors">About Us</Link></li>
                <li><Link href="#" className="text-[var(--foreground)]/60 hover:text-[var(--primary)] transition-colors">Contact</Link></li>
                <li><Link href="#" className="text-[var(--foreground)]/60 hover:text-[var(--primary)] transition-colors">Careers</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-[var(--foreground)]/60 hover:text-[var(--primary)] transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="text-[var(--foreground)]/60 hover:text-[var(--primary)] transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="text-[var(--foreground)]/60 hover:text-[var(--primary)] transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-[var(--border)]/50 text-center">
            <p className="text-sm text-[var(--foreground)]/70">
              &copy; 2024 H.I.T.S. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
