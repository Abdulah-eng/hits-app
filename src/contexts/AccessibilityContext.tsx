'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type TextSize = 'small' | 'medium' | 'large' | 'xlarge'

interface AccessibilityContextType {
  textSize: TextSize
  highContrast: boolean
  hasCompletedOnboarding: boolean
  setTextSize: (size: TextSize) => void
  setHighContrast: (enabled: boolean) => void
  setHasCompletedOnboarding: (completed: boolean) => void
  showOnboarding: () => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

const STORAGE_KEYS = {
  TEXT_SIZE: 'hits-accessibility-text-size',
  HIGH_CONTRAST: 'hits-accessibility-high-contrast',
  ONBOARDING: 'hits-accessibility-onboarding',
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [textSize, setTextSizeState] = useState<TextSize>('medium')
  const [highContrast, setHighContrastState] = useState(false)
  const [hasCompletedOnboarding, setHasCompletedOnboardingState] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Load preferences from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTextSize = localStorage.getItem(STORAGE_KEYS.TEXT_SIZE) as TextSize
      const savedHighContrast = localStorage.getItem(STORAGE_KEYS.HIGH_CONTRAST) === 'true'
      const savedOnboarding = localStorage.getItem(STORAGE_KEYS.ONBOARDING)
      
      if (savedTextSize && ['small', 'medium', 'large', 'xlarge'].includes(savedTextSize)) {
        setTextSizeState(savedTextSize)
      }
      setHighContrastState(savedHighContrast)
      // If onboarding key exists and is 'true', user has completed it. Otherwise show it.
      setHasCompletedOnboardingState(savedOnboarding === 'true')
      setMounted(true)
    }
  }, [])

  // Apply text size to document
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      root.classList.remove('text-small', 'text-medium', 'text-large', 'text-xlarge')
      root.classList.add(`text-${textSize}`)
    }
  }, [textSize])

  // Apply high contrast mode
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      if (highContrast) {
        root.classList.add('high-contrast')
      } else {
        root.classList.remove('high-contrast')
      }
    }
  }, [highContrast])

  const setTextSize = (size: TextSize) => {
    setTextSizeState(size)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TEXT_SIZE, size)
    }
  }

  const setHighContrast = (enabled: boolean) => {
    setHighContrastState(enabled)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.HIGH_CONTRAST, enabled.toString())
    }
  }

  const setHasCompletedOnboarding = (completed: boolean) => {
    setHasCompletedOnboardingState(completed)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ONBOARDING, completed.toString())
    }
  }

  const showOnboarding = () => {
    setHasCompletedOnboardingState(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ONBOARDING, 'false')
    }
  }

  const value = {
    textSize,
    highContrast,
    hasCompletedOnboarding,
    setTextSize,
    setHighContrast,
    setHasCompletedOnboarding,
    showOnboarding,
  }

  // Always provide the context, even before mounted (to avoid context errors)
  // The mounted check was causing issues because components need context immediately
  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}

