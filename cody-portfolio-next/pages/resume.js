import { useEffect, useRef, useState } from 'react'
import Layout from '../src/components/Layout'
import { FiMail, FiLinkedin, FiGithub } from 'react-icons/fi'

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
            className={`transition-all duration-700 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
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

                    <h2 className="text-2xl font-display font-semibold gradient-text mb-4 mt-6">Contact</h2>

                    {/* --- THEMED ICON BUTTONS --- */}
                    <div className="flex gap-4 mt-3">

                        {/* Email */}
                        <a
                            href="mailto:gameprogrammercody@gmail.com"
                            className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-400/20 
                         flex items-center justify-center text-xl text-cyan-200
                         backdrop-blur-sm transition-all
                         hover:bg-cyan-500/20 hover:border-cyan-300/40 hover:text-cyan-100
                         hover:shadow-[0_0_15px_rgba(0,255,255,0.35)]"
                        >
                            <FiMail />
                        </a>

                        {/* LinkedIn */}
                        <a
                            href="https://linkedin.com/in/cody-way"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-400/20 
                         flex items-center justify-center text-xl text-cyan-200
                         backdrop-blur-sm transition-all
                         hover:bg-cyan-500/20 hover:border-cyan-300/40 hover:text-cyan-100
                         hover:shadow-[0_0_15px_rgba(0,255,255,0.35)]"
                        >
                            <FiLinkedin />
                        </a>

                        {/* GitHub */}
                        <a
                            href="https://github.com/GameProgrammerCody/gameplay-systems"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-400/20 
                         flex items-center justify-center text-xl text-cyan-200
                         backdrop-blur-sm transition-all
                         hover:bg-cyan-500/20 hover:border-cyan-300/40 hover:text-cyan-100
                         hover:shadow-[0_0_15px_rgba(0,255,255,0.35)]"
                        >
                            <FiGithub />
                        </a>

                    </div>

                </FadeInSection>
            </div>
        </section>
    )
}
