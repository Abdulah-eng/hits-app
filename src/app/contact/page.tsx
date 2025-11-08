'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "@/components/Navigation"
import { Footer } from "@/components/Footer"
import { ScaleUp, RotateIn, BounceIn, SlideInLeft, SlideInRight } from "@/components/AnimationVariants"
import { 
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle
} from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill in all required fields')
      return
    }

    // Simulate form submission
    setTimeout(() => {
      setSubmitted(true)
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    }, 500)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      content: "1-800-HITS-HELP",
      subtitle: "(1-800-448-7435)",
      description: "Mon-Fri 9am-6pm EST"
    },
    {
      icon: Mail,
      title: "Email",
      content: "support@hits.com",
      subtitle: "info@hits.com",
      description: "We'll respond within 24 hours"
    },
    {
      icon: MapPin,
      title: "Address",
      content: "123 Tech Street",
      subtitle: "San Francisco, CA 94105",
      description: "United States"
    },
    {
      icon: Clock,
      title: "Business Hours",
      content: "Monday - Friday",
      subtitle: "9:00 AM - 6:00 PM EST",
      description: "Saturday & Sunday: Closed"
    },
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
                  Get In Touch
                </h1>
                <p className="text-xl md:text-2xl text-[var(--foreground)]/70 leading-relaxed">
                  Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                </p>
              </div>
            </BounceIn>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-16 lg:py-24 bg-white dark:bg-[var(--background)]">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
              {contactInfo.map((info, index) => {
                const Icon = info.icon
                const animationType = index % 4
                const AnimationComponent = 
                  animationType === 0 ? SlideInLeft :
                  animationType === 1 ? SlideInRight :
                  animationType === 2 ? RotateIn :
                  ScaleUp
                
                return (
                  <AnimationComponent key={index} delay={index * 100}>
                    <Card className="border border-[var(--border)] hover:shadow-lg transition-all duration-300 hover:scale-105 text-center group">
                      <CardHeader>
                        <div className="w-14 h-14 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                          <Icon className="w-7 h-7 text-[var(--primary)]" />
                        </div>
                        <CardTitle className="text-lg mb-2">{info.title}</CardTitle>
                        <CardDescription className="text-base font-medium text-[var(--foreground)]">
                          {info.content}
                        </CardDescription>
                        <CardDescription className="text-sm">
                          {info.subtitle}
                        </CardDescription>
                        <CardDescription className="text-xs mt-2">
                          {info.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </AnimationComponent>
                )
              })}
            </div>

            {/* Contact Form */}
            <div className="max-w-2xl mx-auto">
              <ScaleUp delay={200}>
                <Card className="border border-[var(--border)] shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl md:text-3xl mb-2">Send Us a Message</CardTitle>
                    <CardDescription className="text-base">
                      Fill out the form below and we'll get back to you as soon as possible.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {submitted ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mb-4">
                          <CheckCircle2 className="w-8 h-8 text-[var(--primary)]" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-[var(--foreground)]">Message Sent!</h3>
                        <p className="text-[var(--foreground)]/70 text-center mb-6">
                          Thank you for contacting us. We'll get back to you within 24 hours.
                        </p>
                        <Button onClick={() => setSubmitted(false)} variant="outline">
                          Send Another Message
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-base font-medium">
                              Name <span className="text-[var(--destructive)]">*</span>
                            </Label>
                            <Input
                              id="name"
                              name="name"
                              type="text"
                              value={formData.name}
                              onChange={handleChange}
                              placeholder="Your name"
                              required
                              className="h-12 border-2 focus:border-[var(--primary)] transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-base font-medium">
                              Email <span className="text-[var(--destructive)]">*</span>
                            </Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleChange}
                              placeholder="your.email@example.com"
                              required
                              className="h-12 border-2 focus:border-[var(--primary)] transition-all"
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="phone" className="text-base font-medium">Phone</Label>
                            <Input
                              id="phone"
                              name="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={handleChange}
                              placeholder="(555) 123-4567"
                              className="h-12 border-2 focus:border-[var(--primary)] transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="subject" className="text-base font-medium">Subject</Label>
                            <Input
                              id="subject"
                              name="subject"
                              type="text"
                              value={formData.subject}
                              onChange={handleChange}
                              placeholder="What is this regarding?"
                              className="h-12 border-2 focus:border-[var(--primary)] transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message" className="text-base font-medium">
                            Message <span className="text-[var(--destructive)]">*</span>
                          </Label>
                          <Textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Tell us how we can help..."
                            required
                            rows={6}
                            className="border-2 focus:border-[var(--primary)] transition-all resize-none"
                          />
                        </div>

                        {error && (
                          <div className="flex items-center space-x-2 text-[var(--destructive)] bg-[var(--destructive)]/10 dark:bg-[var(--destructive)]/20 p-4 rounded-lg border border-[var(--destructive)]/20">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm">{error}</span>
                          </div>
                        )}

                        <Button
                          type="submit"
                          className="w-full h-12 text-lg bg-[var(--primary)] hover:bg-[var(--primary)]/90 transition-all duration-300 hover:scale-105"
                        >
                          Send Message
                          <Send className="ml-2 w-5 h-5" />
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </ScaleUp>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

