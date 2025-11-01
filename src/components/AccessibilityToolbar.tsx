'use client'

import { useState } from 'react'
import { useAccessibility } from '@/contexts/AccessibilityContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Type, 
  Contrast, 
  Minus, 
  Plus,
  X,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react'

export function AccessibilityToolbar() {
  const { 
    textSize, 
    highContrast, 
    setTextSize, 
    setHighContrast,
    showOnboarding
  } = useAccessibility()
  
  const [isExpanded, setIsExpanded] = useState(false)

  const textSizes: { value: 'small' | 'medium' | 'large' | 'xlarge'; label: string }[] = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
    { value: 'xlarge', label: 'Extra Large' },
  ]

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Card className="shadow-2xl border-2 border-[var(--primary)]/20 backdrop-blur-xl bg-white/90 dark:bg-[var(--card)]/90 overflow-hidden transition-all duration-300 hover:shadow-2xl">
        <div className="p-3">
          {/* Toolbar Header */}
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[var(--foreground)] hover:bg-[var(--primary)]/10 transition-all duration-300 group"
              aria-label={isExpanded ? 'Collapse accessibility toolbar' : 'Expand accessibility toolbar'}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center mr-2 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <Type className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">Accessibility</span>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 ml-2 transition-transform duration-300" />
              ) : (
                <ChevronUp className="w-4 h-4 ml-2 transition-transform duration-300" />
              )}
            </Button>
          </div>

          {/* Expanded Controls */}
          {isExpanded && (
            <div className="space-y-4 border-t border-[var(--border)]/50 pt-4 animate-fade-in">
              {/* Text Size Controls */}
              <div>
                <label className="flex items-center text-sm font-semibold mb-3 text-[var(--foreground)]">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/20 flex items-center justify-center mr-2">
                    <Type className="w-4 h-4 text-[var(--primary)]" />
                  </div>
                  Text Size
                </label>
                <div className="flex gap-2 flex-wrap">
                  {textSizes.map((size) => (
                    <Button
                      key={size.value}
                      variant={textSize === size.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTextSize(size.value)}
                      className={
                        textSize === size.value
                          ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300'
                          : 'border-2 hover:bg-[var(--primary)]/10 hover:border-[var(--primary)] hover:scale-105 transition-all duration-300'
                      }
                      aria-label={`Set text size to ${size.label}`}
                    >
                      {size.value === 'small' && <Minus className="w-3 h-3" />}
                      {size.value === 'medium' && <Type className="w-3 h-3" />}
                      {size.value === 'large' && <Plus className="w-3 h-3" />}
                      {size.value === 'xlarge' && (
                        <>
                          <Plus className="w-3 h-3" />
                          <Plus className="w-3 h-3" />
                        </>
                      )}
                      <span className="ml-1">{size.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* High Contrast Toggle */}
              <div>
                <label className="flex items-center text-sm font-semibold mb-3 text-[var(--foreground)]">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[var(--accent)]/20 to-[var(--primary)]/20 flex items-center justify-center mr-2">
                    <Contrast className="w-4 h-4 text-[var(--accent)]" />
                  </div>
                  Display Options
                </label>
                <Button
                  variant={highContrast ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setHighContrast(!highContrast)}
                  className={
                    highContrast
                      ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 w-full'
                      : 'border-2 hover:bg-[var(--primary)]/10 hover:border-[var(--primary)] hover:scale-105 transition-all duration-300 w-full'
                  }
                  aria-label={highContrast ? 'Disable high contrast mode' : 'Enable high contrast mode'}
                >
                  <Contrast className="w-4 h-4 mr-2" />
                  {highContrast ? 'High Contrast On' : 'High Contrast Off'}
                </Button>
              </div>

              {/* Onboarding Help */}
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={showOnboarding}
                  className="w-full border-2 hover:bg-[var(--primary)]/10 hover:border-[var(--primary)] hover:scale-105 transition-all duration-300 group"
                  aria-label="Show onboarding tutorial"
                >
                  <HelpCircle className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                  Show Tutorial
                  <Sparkles className="w-4 h-4 ml-2 opacity-50 group-hover:opacity-100 group-hover:animate-spin-slow transition-opacity duration-300" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
