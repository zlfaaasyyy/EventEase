import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function Footer() {
  const [email, setEmail] = useState('')

  return (
    <footer className="w-full py-xl px-lg grid grid-cols-1 md:grid-cols-4 gap-lg bg-surface-container-highest border-t border-outline-variant">
      {/* Brand */}
      <div className="space-y-md">
        <span className="text-headline-sm font-bold text-on-surface block">EventEase</span>
        <p className="text-body-md text-on-surface-variant">
          The leading platform for managing and discovering professional events worldwide. Join us today and elevate your career.
        </p>
        <div className="flex gap-md">
          <button className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-primary hover:text-white transition-all text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]">public</span>
          </button>
          <button className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-primary hover:text-white transition-all text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]">alternate_email</span>
          </button>
          <button className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-primary hover:text-white transition-all text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]">share</span>
          </button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="space-y-md">
        <h4 className="font-bold text-on-surface text-title-lg">Quick Links</h4>
        <ul className="space-y-sm">
          <li><Link to="/" className="text-on-surface-variant hover:text-primary transition-colors text-body-md">About Us</Link></li>
          <li><Link to="/" className="text-on-surface-variant hover:text-primary transition-colors text-body-md">Contact</Link></li>
          <li><Link to="/" className="text-on-surface-variant hover:text-primary transition-colors text-body-md">Blog</Link></li>
          <li><Link to="/" className="text-on-surface-variant hover:text-primary transition-colors text-body-md">Careers</Link></li>
        </ul>
      </div>

      {/* Support */}
      <div className="space-y-md">
        <h4 className="font-bold text-on-surface text-title-lg">Support</h4>
        <ul className="space-y-sm">
          <li><Link to="/" className="text-on-surface-variant hover:text-primary transition-colors text-body-md">Privacy Policy</Link></li>
          <li><Link to="/" className="text-on-surface-variant hover:text-primary transition-colors text-body-md">Terms of Service</Link></li>
          <li><Link to="/" className="text-on-surface-variant hover:text-primary transition-colors text-body-md">Help Center</Link></li>
          <li><Link to="/" className="text-on-surface-variant hover:text-primary transition-colors text-body-md">FAQ</Link></li>
        </ul>
      </div>

      {/* Newsletter */}
      <div className="space-y-md">
        <h4 className="font-bold text-on-surface text-title-lg">Newsletter</h4>
        <p className="text-label-md text-on-surface-variant">Stay updated with the latest events and news.</p>
        <div className="flex gap-xs">
          <input
            className="bg-surface-container-low border border-outline-variant px-md py-2 rounded-lg flex-1 text-body-md focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="bg-primary text-on-primary px-md py-2 rounded-lg font-bold text-label-md hover:opacity-90 transition-all">
            Join
          </button>
        </div>
        <p className="text-label-sm text-on-surface-variant">© 2025 EventEase Management. All rights reserved.</p>
      </div>
    </footer>
  )
}