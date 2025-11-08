'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "@/components/Navigation"
import { Footer } from "@/components/Footer"
import { ScaleUp, RotateIn, BounceIn, FlipIn, FadeSlideUp } from "@/components/AnimationVariants"
import { Star, Quote } from "lucide-react"

export default function TestimonialsPage() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CEO, TechStart Inc",
      content: "H.I.T.S. transformed how we find IT talent. The quality of specialists is unmatched, and the platform makes collaboration effortless. We've completed 15+ projects through the platform, and every single one exceeded our expectations.",
      rating: 5,
      avatar: "SJ",
      company: "TechStart Inc"
    },
    {
      name: "Michael Chen",
      role: "Freelance Developer",
      content: "As a specialist, I've found incredible opportunities through H.I.T.S. The platform is intuitive, and payments are always secure and on time. I've been able to build a steady client base and grow my business significantly.",
      rating: 5,
      avatar: "MC",
      company: "Independent Consultant"
    },
    {
      name: "Emily Rodriguez",
      role: "Project Manager",
      content: "The verification process gives me confidence in every specialist I work with. It's a game-changer for our IT projects. The communication tools and project tracking features make managing multiple projects a breeze.",
      rating: 5,
      avatar: "ER",
      company: "Digital Solutions Corp"
    },
    {
      name: "David Thompson",
      role: "CTO, InnovateTech",
      content: "We've tried multiple platforms, but H.I.T.S. stands out for its professionalism and quality. The specialists are vetted thoroughly, and the support team is always responsive. Highly recommended!",
      rating: 5,
      avatar: "DT",
      company: "InnovateTech"
    },
    {
      name: "Lisa Wang",
      role: "IT Specialist",
      content: "I love how easy it is to showcase my skills and connect with clients who need my expertise. The platform handles all the administrative work, so I can focus on what I do best - solving IT problems.",
      rating: 5,
      avatar: "LW",
      company: "Freelance IT Consultant"
    },
    {
      name: "Robert Martinez",
      role: "Operations Director",
      content: "The booking system is seamless, and the specialists we've worked with have been exceptional. H.I.T.S. has become an essential part of our IT operations. The ROI has been outstanding.",
      rating: 5,
      avatar: "RM",
      company: "Global Enterprises"
    },
    {
      name: "Jennifer Kim",
      role: "Startup Founder",
      content: "As a startup, we needed reliable IT support without the overhead of a full-time team. H.I.T.S. has been perfect - we get expert help when we need it, and the pricing is transparent and fair.",
      rating: 5,
      avatar: "JK",
      company: "StartupXYZ"
    },
    {
      name: "James Wilson",
      role: "Senior Developer",
      content: "The platform's project management tools are excellent. I can track all my client work in one place, and the secure payment system gives me peace of mind. It's the best platform I've used for freelance work.",
      rating: 5,
      avatar: "JW",
      company: "Independent Developer"
    },
    {
      name: "Amanda Foster",
      role: "IT Director",
      content: "H.I.T.S. has revolutionized our approach to IT projects. We can quickly find specialists for specific needs, and the quality is consistently high. The platform saves us time and money while delivering better results.",
      rating: 5,
      avatar: "AF",
      company: "Enterprise Solutions"
    },
  ]

  const stats = [
    { value: "98%", label: "Satisfaction Rate" },
    { value: "4.9/5", label: "Average Rating" },
    { value: "10K+", label: "Happy Clients" },
    { value: "50K+", label: "Projects Completed" },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-[var(--background)]">
      <Navigation />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-[var(--primary)]/5 via-white to-white dark:from-[var(--primary)]/10 dark:via-[var(--background)] dark:to-[var(--background)] py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-6">
            <RotateIn delay={0}>
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--foreground)] mb-6 leading-tight">
                  What Our Clients Say
                </h1>
                <p className="text-xl md:text-2xl text-[var(--foreground)]/70 leading-relaxed">
                  Trusted by thousands of clients and specialists worldwide. See what they have to say about their experience with H.I.T.S.
                </p>
              </div>
            </RotateIn>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-[var(--secondary)]/50 dark:bg-[var(--card)]/30">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {stats.map((stat, index) => {
                const AnimationComponent = index % 2 === 0 ? BounceIn : ScaleUp
                return (
                  <AnimationComponent key={index} delay={index * 100}>
                    <div className="text-center">
                      <div className="text-3xl md:text-4xl font-bold text-[var(--primary)] mb-2">
                        {stat.value}
                      </div>
                      <div className="text-sm md:text-base text-[var(--foreground)]/70">
                        {stat.label}
                      </div>
                    </div>
                  </AnimationComponent>
                )
              })}
            </div>
          </div>
        </section>

        {/* Testimonials Grid */}
        <section className="py-16 lg:py-24 bg-white dark:bg-[var(--background)]">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {testimonials.map((testimonial, index) => {
                const animationType = index % 4
                const AnimationComponent = 
                  animationType === 0 ? FadeSlideUp :
                  animationType === 1 ? RotateIn :
                  animationType === 2 ? FlipIn :
                  BounceIn
                
                return (
                  <AnimationComponent key={index} delay={index * 80}>
                    <Card className="border border-[var(--border)] hover:shadow-xl transition-all duration-300 hover:scale-105 h-full group">
                      <CardHeader>
                        <div className="absolute top-4 right-4 opacity-10">
                          <Quote className="w-12 h-12 text-[var(--primary)]" />
                        </div>
                        <div className="flex items-center gap-1 mb-4">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <CardDescription className="text-base leading-relaxed mb-6 min-h-[120px] relative z-10">
                          "{testimonial.content}"
                        </CardDescription>
                        <div className="flex items-center gap-3 relative z-10">
                          <div className="w-12 h-12 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-bold">
                            {testimonial.avatar}
                          </div>
                          <div>
                            <CardTitle className="text-lg mb-0">{testimonial.name}</CardTitle>
                            <p className="text-sm text-[var(--foreground)]/60">{testimonial.role}</p>
                            <p className="text-xs text-[var(--foreground)]/50">{testimonial.company}</p>
                          </div>
                        </div>
                      </CardHeader>
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

