'use client'

import { useEffect, useState, ReactNode, createContext, useContext } from 'react'

interface HeroAnimationContextType {
  isVisible: boolean
}

const HeroAnimationContext = createContext<HeroAnimationContextType>({ isVisible: false })

interface HeroAnimationProps {
  children: ReactNode
  initialDelay?: number
}

export function HeroAnimation({ children, initialDelay = 500 }: HeroAnimationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, initialDelay)

    return () => clearTimeout(timer)
  }, [initialDelay])

  return (
    <HeroAnimationContext.Provider value={{ isVisible }}>
      <div
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.8s ease-out, transform 0.8s ease-out'
        }}
      >
        {children}
      </div>
    </HeroAnimationContext.Provider>
  )
}

interface StaggeredItemProps {
  children: ReactNode
  delay: number
  isVisible?: boolean
}

export function StaggeredItem({ children, delay, isVisible: propIsVisible }: StaggeredItemProps) {
  const context = useContext(HeroAnimationContext)
  const isVisible = propIsVisible !== undefined ? propIsVisible : context.isVisible

  return (
    <div
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.6s ease-out ${delay}ms, transform 0.6s ease-out ${delay}ms`
      }}
    >
      {children}
    </div>
  )
}

