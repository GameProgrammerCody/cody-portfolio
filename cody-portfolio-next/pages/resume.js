import { useEffect, useRef, useState } from 'react'
import Layout from '../src/components/Layout'

function FadeInSection({ children }) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      {children}
    </div>
  )
}

export default function Resume() {
  return (
      <section className="max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-3xl font-display font-bold animated-gradient">Resume</h1>

        <p className="text-white/80 mb-4">
          Download my latest resume below or preview it directly in your browser.
        </p>

        <div className="flex gap-3 mb-8">
          <a
            href="/resume/Cody_Way_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            View Full PDF
          </a>
          <a
            href="/resume/Cody_Way_Resume.pdf"
            download
            className="btn btn-ghost"
          >
            Download Resume
          </a>
        </div>

        {/* Inline PDF preview with mobile fallback */}
        <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/20">
          <iframe
            src="/resume/Cody_Way_Resume.pdf#view=FitH"
            className="w-full h-[80vh] hidden md:block"
            title="Cody Way Resume PDF"
          />
          <p className="p-6 text-center text-white/60 md:hidden">
            Your device doesn’t support PDF preview — use the buttons above to
            download or view it.
          </p>
        </div>

        {/* Animated content below */}
        <div className="mt-10 grid md:grid-cols-2 gap-8">
          <FadeInSection>
            <h2 className="text-2xl font-display font-semibold gradient-text mb-4">Core Skills</h2>
            <ul className="list-disc list-inside text-white/80 space-y-1">
              <li>Unity3D / C# Gameplay Systems</li>
              <li>AI, Procedural Generation, Optimization</li>
              <li>Tooling & Editor Extensions</li>
              <li>Cross-platform Game Development (Windows, Android, iOS)</li>
              <li>Git, CI/CD, and Collaboration Pipelines</li>
            </ul>
          </FadeInSection>

          <FadeInSection>
            <h2 className="text-2xl font-display font-semibold gradient-text mb-4">Education</h2>
            <p className="text-white/80">
              <strong>BSc (Hons) Games Programming</strong>
              <br />
              Bournemouth University
            </p>

            <h2 className="text-2xl font-display font-semibold gradient-text mb-4">Contact</h2>
            <p className="text-white/80">
              <a
                href="mailto:gameprogrammercody@gmail.com"
                className="text-cyan-300 hover:underline"
              >
                gameprogrammercody@gmail.com
              </a>
              <br />
              <a
                href="https://linkedin.com/in/cody-way-370a419a"
                className="text-cyan-300 hover:underline"
              >
                linkedin.com/in/cody-way-370a419a
              </a>
            </p>
          </FadeInSection>
        </div>
      </section>
  )
}
