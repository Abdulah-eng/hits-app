'use client'

import { AccessibilityToolbar } from './AccessibilityToolbar'
import { OnboardingTutorial } from './OnboardingTutorial'
import { AIChatbot } from './AIChatbot'

export function AccessibilityWrapper() {
  return (
    <>
      <AccessibilityToolbar />
      <OnboardingTutorial />
      <AIChatbot />
    </>
  )
}

