'use client'

import Link from 'next/link'
import { Code, Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Youtube } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-[var(--card)] dark:bg-[var(--background)] border-t border-[var(--border)]">
      <div className="container mx-auto px-4 lg:px-6 py-12 lg:py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-[var(--primary)] rounded-lg flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-[var(--foreground)]">
                H.I.T.S.
              </span>
            </div>
            <p className="text-sm text-[var(--foreground)]/70 mb-4">
              Connecting businesses with top IT talent worldwide. Secure, verified, and reliable.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-[var(--foreground)]/60 hover:text-[var(--primary)] transition-all duration-300 hover:scale-110" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-[var(--foreground)]/60 hover:text-[var(--primary)] transition-all duration-300 hover:scale-110" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-[var(--foreground)]/60 hover:text-[var(--primary)] transition-all duration-300 hover:scale-110" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-[var(--foreground)]/60 hover:text-[var(--primary)] transition-all duration-300 hover:scale-110" aria-label="YouTube">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-[var(--foreground)]">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-[var(--foreground)]/70 hover:text-[var(--primary)] transition-all duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-[var(--foreground)]/70 hover:text-[var(--primary)] transition-all duration-300">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-[var(--foreground)]/70 hover:text-[var(--primary)] transition-all duration-300">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/testimonials" className="text-[var(--foreground)]/70 hover:text-[var(--primary)] transition-all duration-300">
                  Testimonials
                </Link>
              </li>
              <li>
                <Link href="/auth/sign-up" className="text-[var(--foreground)]/70 hover:text-[var(--primary)] transition-all duration-300">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4 text-[var(--foreground)]">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-[var(--foreground)]/70 hover:text-[var(--primary)] transition-all duration-300">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="text-[var(--foreground)]/70 hover:text-[var(--primary)] transition-all duration-300">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="text-[var(--foreground)]/70 hover:text-[var(--primary)] transition-all duration-300">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-[var(--foreground)]/70 hover:text-[var(--primary)] transition-all duration-300">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4 text-[var(--foreground)]">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 text-[var(--foreground)]/70">
                <Phone className="w-5 h-5 text-[var(--primary)] flex-shrink-0 mt-0.5" />
                <span>1-800-HITS-HELP</span>
              </li>
              <li className="flex items-start gap-3 text-[var(--foreground)]/70">
                <Mail className="w-5 h-5 text-[var(--primary)] flex-shrink-0 mt-0.5" />
                <span>support@hits.com</span>
              </li>
              <li className="flex items-start gap-3 text-[var(--foreground)]/70">
                <MapPin className="w-5 h-5 text-[var(--primary)] flex-shrink-0 mt-0.5" />
                <span>123 Tech Street<br />San Francisco, CA 94105</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-[var(--border)]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[var(--foreground)]/70">
              &copy; {new Date().getFullYear()} H.I.T.S. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="#" className="text-[var(--foreground)]/70 hover:text-[var(--primary)] transition-all duration-300">
                Privacy Policy
              </Link>
              <Link href="#" className="text-[var(--foreground)]/70 hover:text-[var(--primary)] transition-all duration-300">
                Terms of Service
              </Link>
              <Link href="#" className="text-[var(--foreground)]/70 hover:text-[var(--primary)] transition-all duration-300">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

