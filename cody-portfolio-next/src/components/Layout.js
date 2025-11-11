import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import ParticleBackground from './ParticleBackground'

// Inject shimmer animation if not present
if (typeof window !== "undefined" && !document.getElementById("shimmer-anim")) {
  const style = document.createElement("style")
  style.id = "shimmer-anim"
  style.innerHTML = `
    @keyframes shimmer {
      0% { background-position: 200% center; }
      50% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
  `
  document.head.appendChild(style)
}

export default function Layout({ children }) {
  const [scrolled, setScrolled] = useState(false)
  const [footerVisible, setFooterVisible] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const footerRef = useRef(null)

  // Header blur + shadow on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Footer glow fade-in
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => setFooterVisible(entry.isIntersecting))
      },
      { threshold: 0.2 }
    )
    if (footerRef.current) observer.observe(footerRef.current)
    return () => observer.disconnect()
  }, [])

  // Close menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="min-h-screen text-white relative overflow-x-hidden">
      <ParticleBackground />

      {/* ----- Header ----- */}
      <header
        className={`fixed top-0 left-0 right-0 z-30 transition-all duration-500 border-b border-cyan-400/20 ${
          scrolled
            ? 'backdrop-blur-md bg-gradient-to-r from-cyan-900/40 via-blue-900/40 to-indigo-900/40 shadow-[0_0_25px_rgba(0,255,255,0.15)]'
            : 'bg-transparent backdrop-blur-none'
        }`}
      >
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          {/* Logo / Name */}
          <Link
            href="/"
                      scroll={false} className="font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r 
                       from-cyan-400 via-blue-300 to-indigo-400 bg-[length:200%_auto]
                       animate-[shimmer_10s_ease-in-out_infinite] transition hover:opacity-90 text-lg sm:text-xl"
          >
            CODY WAY
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-4 text-sm items-center">
            {[
              { href: '/projects', label: 'Projects' },
              { href: '/about', label: 'About' },
              { href: '/resume', label: 'Resume' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                    scroll={false} className="relative px-3 py-1 rounded-xl group"
              >
                <span className="text-white/80 group-hover:text-cyan-300 transition-colors duration-300">
                  {item.label}
                </span>
                <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-gradient-to-r from-cyan-400 to-blue-400 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}

            <a
              href="mailto:gameprogrammercody@gmail.com"
              className="ml-2 px-3 py-1 rounded-xl bg-gradient-to-r from-cyan-500/30 to-blue-500/30 
                         border border-cyan-400/30 text-cyan-200 text-xs font-semibold hover:from-cyan-500/50 
                         hover:to-blue-500/50 transition-all shadow-[0_0_10px_rgba(0,255,255,0.15)]"
            >
              Hire Me
            </a>

            <div className="ml-3">
              <GalaxyToggle />
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-cyan-300 hover:text-white transition text-2xl"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="bg-black/80 backdrop-blur-md border-t border-cyan-400/20 text-center py-4 space-y-3">
            {[
              { href: '/projects', label: 'Projects' },
              { href: '/about', label: 'About' },
              { href: '/resume', label: 'Resume' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                    scroll={false} className="block text-white/80 hover:text-cyan-300 transition-colors"
              >
                {item.label}
              </Link>
            ))}

            <a
              href="mailto:gameprogrammercody@gmail.com"
              className="inline-block mt-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/30 to-blue-500/30 
                         border border-cyan-400/30 text-cyan-200 text-xs font-semibold hover:from-cyan-500/50 
                         hover:to-blue-500/50 transition-all shadow-[0_0_10px_rgba(0,255,255,0.15)]"
            >
              Hire Me
            </a>

            <div className="pt-2 flex justify-center">
              <GalaxyToggle />
            </div>
          </div>
        </div>
      </header>

      {/* ----- Page Content ----- */}
      <main className="mx-auto max-w-6xl px-4 pt-24 pb-16">{children}</main>

      {/* ----- Footer ----- */}
      <footer
        ref={footerRef}
        className="relative mt-10 border-t border-cyan-400/20 bg-gradient-to-r from-cyan-950/40 via-blue-950/40 to-indigo-950/40 backdrop-blur-md overflow-hidden group"
      >
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-[140%] h-48 
                      bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.18)_0%,rgba(60,120,255,0.1)_40%,transparent_80%)]
                      blur-[100px] transition-all duration-[2000ms] ease-out
                      ${footerVisible ? 'opacity-90 scale-100' : 'opacity-0 scale-75'}`}
        />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-cyan-400/50 via-blue-400/50 to-transparent"></div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 grid md:grid-cols-3 gap-8 text-sm">
          <div className="space-y-2">
            <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
              CODY WAY
            </h3>
            <p className="text-white/60">Gameplay Programmer & Systems Developer</p>
            <p className="text-white/50">© {new Date().getFullYear()} Cody Way</p>
          </div>
          <div className="flex flex-col space-y-2">
            <h4 className="font-semibold text-cyan-300/90 text-sm uppercase tracking-wide relative mb-1">
              Explore
              <span className="absolute bottom-0 left-0 w-8 h-[1px] bg-gradient-to-r from-cyan-400/70 to-transparent"></span>
            </h4>
                      <Link href="/" scroll={false} className="text-white/60 hover:text-cyan-300 transition-colors">Home</Link>
                      <Link href="/projects" scroll={false} className="text-white/60 hover:text-cyan-300 transition-colors">Projects</Link>
                      <Link href="/about" scroll={false} className="text-white/60 hover:text-cyan-300 transition-colors">About</Link>
                      <Link href="/resume" scroll={false} className="text-white/60 hover:text-cyan-300 transition-colors">Resume</Link>
          </div>
          <div className="flex flex-col space-y-2">
            <h4 className="font-semibold text-cyan-300/90 text-sm uppercase tracking-wide relative mb-1">
              Contact
              <span className="absolute bottom-0 left-0 w-8 h-[1px] bg-gradient-to-r from-cyan-400/70 to-transparent"></span>
            </h4>
            <a href="mailto:gameprogrammercody@gmail.com" className="text-white/60 hover:text-cyan-300 transition-colors">
              gameprogrammercody@gmail.com
            </a>
            <a href="https://linkedin.com/in/cody-way" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-cyan-300 transition-colors">
              LinkedIn
            </a>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-blue-400/40"></div>
      </footer>
    </div>
  )
}

/* --- Galaxy Toggle (old icon restored + mobile-safe tooltip) --- */
function GalaxyToggle() {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === "undefined") return true
    const saved = localStorage.getItem("reduceMotion")
    return saved !== "true"
  })
  const [showHint, setShowHint] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const seen = sessionStorage.getItem("seenGalaxyHint")
    if (!seen && !isMobile) {
      setShowHint(true)
      sessionStorage.setItem("seenGalaxyHint", "true")
      const timer = setTimeout(() => setShowHint(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [isMobile])

  const toggle = () => {
    const newValue = !enabled
    setEnabled(newValue)
    if (typeof window !== "undefined") {
      localStorage.setItem("reduceMotion", newValue ? "false" : "true")
      const event = new CustomEvent("motionToggle", { detail: newValue })
      window.dispatchEvent(event)
    }
  }

  return (
    <div className="relative flex flex-col items-center group">
      <button
        onClick={toggle}
        className={`relative p-2 rounded-full border backdrop-blur-sm transition-all duration-500
          ${enabled
            ? "border-cyan-400/50 text-cyan-200 bg-black/40 shadow-[0_0_15px_rgba(0,255,255,0.25)]"
            : "border-blue-400/40 text-blue-300 bg-black/30 shadow-[0_0_10px_rgba(100,160,255,0.25)]"
          }`}
        aria-label="Toggle motion effects"
      >
        {/* Restored original orbit icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className={`relative w-5 h-5 transition-transform duration-700 ${
            enabled ? "rotate-0 text-cyan-300" : "rotate-180 text-blue-300"
          }`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3c2.5 0 4 2 4 4.5S14 12 12 12s-4 2.5-4 4.5S9.5 21 12 21m0-18a9 9 0 100 18 9 9 0 000-18z"
          />
        </svg>
      </button>

      {/* Tooltip only on desktop */}
      {!isMobile && (
        <div
          className={`absolute top-full mt-2 px-2 py-1 text-[11px] rounded-md border text-cyan-200 bg-black/80 border-cyan-400/30 shadow-[0_0_10px_rgba(0,255,255,0.25)]
            transition-all duration-300 ${
              showHint || "opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0"
            }`}
        >
          Motion: {enabled ? "On" : "Off"}
        </div>
      )}
    </div>
  )
}
