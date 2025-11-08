'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Code, Menu, X } from 'lucide-react'

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/services', label: 'Services' },
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/testimonials', label: 'Testimonials' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-[var(--card)]/80 border-b border-[var(--border)]/50 transition-all duration-300 ${scrollY > 10 ? 'shadow-lg bg-white/95 dark:bg-[var(--card)]/95' : ''}`}>
      <nav className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-[var(--primary)] rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg">
              <Code className="w-6 h-6 text-white transition-transform duration-300 group-hover:scale-110" />
            </div>
            <span className="text-xl lg:text-2xl font-bold text-[var(--foreground)] transition-all duration-300 group-hover:text-[var(--primary)]">
              H.I.T.S.
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[var(--foreground)] hover:text-[var(--primary)] transition-all duration-300 font-medium relative group px-2 py-1 overflow-hidden ${
                  pathname === item.href ? 'text-[var(--primary)]' : ''
                }`}
              >
                <span className="relative z-10">{item.label}</span>
                {/* Animated underline - animates from left to right */}
                <span 
                  className={`absolute bottom-0 left-0 h-0.5 bg-[var(--primary)] origin-left ${
                    pathname === item.href 
                      ? 'w-full' 
                      : 'w-0 group-hover:w-full'
                  }`}
                  style={{
                    transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
                {/* Hover background effect */}
                <span className="absolute inset-0 bg-[var(--primary)]/5 rounded-md scale-0 group-hover:scale-100 transition-transform duration-300 origin-center" />
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <Button 
              variant="ghost" 
              asChild
              className="transition-all duration-300 hover:bg-[var(--primary)]/10 hover:scale-105"
            >
              <Link href="/auth/sign-in">Sign In</Link>
            </Button>
            <Button 
              asChild 
              className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 transition-transform duration-300 hover:scale-110"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 transition-all duration-300" />
            ) : (
              <Menu className="w-6 h-6 transition-all duration-300" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="py-4 border-t border-[var(--border)]">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-[var(--foreground)] hover:text-[var(--primary)] transition-all duration-300 px-4 py-2 rounded-lg hover:bg-[var(--primary)]/10 ${
                    pathname === item.href ? 'text-[var(--primary)] bg-[var(--primary)]/10' : ''
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 px-4 pt-4 border-t border-[var(--border)]">
                <Button variant="outline" asChild className="w-full transition-all duration-300">
                  <Link href="/auth/sign-in" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                </Button>
                <Button asChild className="w-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 transition-all duration-300">
                  <Link href="/auth/sign-up" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

