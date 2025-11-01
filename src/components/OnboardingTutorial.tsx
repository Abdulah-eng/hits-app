'use client'

import { useState, useEffect } from 'react'
import { useAccessibility } from '@/contexts/AccessibilityContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRight, ArrowLeft, Check, X, Home, User, Calendar, Settings } from 'lucide-react'

interface TutorialStep {
  title: string
  description: string
  icon: React.ReactNode
  content: React.ReactNode
}

export function OnboardingTutorial() {
  const { hasCompletedOnboarding, setHasCompletedOnboarding } = useAccessibility()
  const [currentStep, setCurrentStep] = useState(0)

  const steps: TutorialStep[] = [
    {
      title: 'Welcome to H.I.T.S.',
      description: 'Your guide to getting started',
      icon: <Home className="w-8 h-8 text-[var(--primary)]" />,
      content: (
        <div className="space-y-4">
          <p className="text-[var(--foreground)]/90">
            Welcome! This quick tutorial will help you navigate H.I.T.S. (Hire I.T. Specialists).
          </p>
          <p className="text-[var(--foreground)]/90">
            Our platform connects you with verified IT specialists for all your technology needs.
          </p>
        </div>
      ),
    },
    {
      title: 'Accessibility Features',
      description: 'Customize your experience',
      icon: <Settings className="w-8 h-8 text-[var(--primary)]" />,
      content: (
        <div className="space-y-4">
          <p className="text-[var(--foreground)]/90">
            Look for the <strong>Accessibility</strong> button in the bottom-right corner of your screen.
          </p>
          <Card className="p-4 bg-[var(--secondary)]">
            <ul className="space-y-2 text-[var(--foreground)]/90">
              <li className="flex items-start">
                <span className="mr-2">📝</span>
                <span><strong>Text Size:</strong> Choose from Small, Medium, Large, or Extra Large</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">⚡</span>
                <span><strong>High Contrast:</strong> Improve readability with high contrast mode</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">❓</span>
                <span><strong>Show Tutorial:</strong> View this guide anytime</span>
              </li>
            </ul>
          </Card>
        </div>
      ),
    },
    {
      title: 'Navigation',
      description: 'Finding your way around',
      icon: <User className="w-8 h-8 text-[var(--primary)]" />,
      content: (
        <div className="space-y-4">
          <p className="text-[var(--foreground)]/90">
            The main navigation is always at the top of the page:
          </p>
          <Card className="p-4 bg-[var(--secondary)]">
            <ul className="space-y-3 text-[var(--foreground)]/90">
              <li className="flex items-center">
                <Home className="w-5 h-5 mr-3 text-[var(--primary)]" />
                <div>
                  <strong>Home:</strong> Return to the main page
                </div>
              </li>
              <li className="flex items-center">
                <User className="w-5 h-5 mr-3 text-[var(--primary)]" />
                <div>
                  <strong>Dashboard:</strong> View your appointments and account
                </div>
              </li>
              <li className="flex items-center">
                <Calendar className="w-5 h-5 mr-3 text-[var(--primary)]" />
                <div>
                  <strong>Book Appointment:</strong> Schedule time with a specialist
                </div>
              </li>
              <li className="flex items-center">
                <Settings className="w-5 h-5 mr-3 text-[var(--primary)]" />
                <div>
                  <strong>Settings:</strong> Manage your preferences
                </div>
              </li>
            </ul>
          </Card>
        </div>
      ),
    },
    {
      title: 'Booking an Appointment',
      description: 'How to schedule a consultation',
      icon: <Calendar className="w-8 h-8 text-[var(--primary)]" />,
      content: (
        <div className="space-y-4">
          <p className="text-[var(--foreground)]/90">
            Booking an appointment is easy:
          </p>
          <Card className="p-4 bg-[var(--secondary)]">
            <ol className="space-y-3 text-[var(--foreground)]/90 list-decimal list-inside">
              <li>Click <strong>"Book Appointment"</strong> in the navigation</li>
              <li>Select an IT specialist from the list</li>
              <li>Choose a date and available time slot</li>
              <li>Enter a description of what you need help with</li>
              <li>Review and confirm your booking</li>
            </ol>
          </Card>
        </div>
      ),
    },
    {
      title: 'You\'re All Set!',
      description: 'Ready to get started',
      icon: <Check className="w-8 h-8 text-[var(--accent)]" />,
      content: (
        <div className="space-y-4 text-center">
          <p className="text-lg text-[var(--foreground)]/90">
            You're ready to start using H.I.T.S.!
          </p>
          <Card className="p-4 bg-[var(--secondary)]">
            <p className="text-[var(--foreground)]/90">
              Remember: You can always access the accessibility features and view this tutorial again using the <strong>Accessibility</strong> button in the bottom-right corner.
            </p>
          </Card>
          <p className="text-[var(--foreground)]/70 text-sm">
            Need help? Contact support at support@hits-app.com
          </p>
        </div>
      ),
    },
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    setHasCompletedOnboarding(true)
  }

  const handleSkip = () => {
    setHasCompletedOnboarding(true)
  }

  if (hasCompletedOnboarding) {
    return null
  }

  const currentStepData = steps[currentStep]

  return (
    <Dialog open={!hasCompletedOnboarding} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {currentStepData.icon}
            <div>
              <DialogTitle className="text-2xl">{currentStepData.title}</DialogTitle>
              <DialogDescription className="text-base">
                Step {currentStep + 1} of {steps.length}: {currentStepData.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4 min-h-[200px]">
          {currentStepData.content}
        </div>

        {/* Progress Indicator */}
        <div className="flex gap-2 justify-center mb-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentStep
                  ? 'bg-[var(--primary)] w-8'
                  : index < currentStep
                  ? 'bg-[var(--accent)] w-2'
                  : 'bg-[var(--border)] w-2'
              }`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center gap-4">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-[var(--foreground)]/70"
          >
            <X className="w-4 h-4 mr-2" />
            Skip Tutorial
          </Button>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="bg-[var(--primary)] hover:opacity-90"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Get Started
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

