import { useEffect, useState } from 'react'
import data from '../src/data/projects.json'
import Link from 'next/link'
import ProjectCard from '../src/components/ProjectCard'
import { FiMail, FiLinkedin, FiGithub } from 'react-icons/fi'

export default function Home() {
    const [isVisible, setIsVisible] = useState(false)
    const featured = data.projects.filter((p) => p.featured)

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 100)
        return () => clearTimeout(timer)
    }, [])

    return (
        <>
            <div
                className={`transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
            >
                {/* ---- Hero Section ---- */}
                <section className="text-center py-12 px-4">
                    <h1
                        className="text-4xl sm:text-5xl md:text-7xl font-display font-bold animated-gradient leading-tight break-words"
                    >
                        Game Programmer
                    </h1>

                    <p className="mt-4 text-white/80 max-w-2xl mx-auto leading-relaxed font-sans text-base sm:text-lg">
                        Specializing in gameplay systems, Unity3D, and AI. I build polished, performant player experiences across mobile and desktop.
                    </p>

                    <div className="mt-6 flex justify-center gap-3 flex-wrap">
                        <Link href="/projects" scroll={false} className="btn btn-primary">
                            View Projects
                        </Link>

                        <Link href="/resume" scroll={false} className="btn btn-ghost">
                            Download Resume
                        </Link>
                    </div>
                </section>

                {/* ---- Featured Projects ---- */}
                <section className="mt-12 px-4">
                    <h2 className="text-2xl font-display font-semibold gradient-text mb-4 text-center">
                        Featured Projects
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {featured.map((p) => (
                            <ProjectCard key={p.slug} project={p} />
                        ))}
                    </div>
                </section>

                {/* ---- About Preview ---- */}
                <section className="mt-14 grid md:grid-cols-3 gap-6 items-center px-4">
                    <div className="md:col-span-2">
                        <h2 className="text-2xl font-display font-semibold gradient-text mb-4">
                            About Me
                        </h2>
                        <p className="mt-3 text-white/80">
                            I’m a gameplay programmer focused on Unity and C#. I enjoy
                            building AI systems, moment-to-moment mechanics, and the tooling
                            that helps teams ship faster.
                        </p>
                        <div className="mt-4">
                            {[
                                'Unity3D',
                                'C#',
                                'C++',
                                'Unreal',
                                'Git',
                                'AI Systems',
                                'Shaders',
                            ].map((t) => (
                                <span
                                    key={t}
                                    className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 mr-2 mb-2 inline-block"
                                >
                                    {t}
                                </span>
                            ))}
                        </div>

                        {/* ---- UPDATED THEMED "More About Me" BUTTON ---- */}
                        <div className="mt-6">
                            <Link
                                href="/about"
                                scroll={false}
                                className="inline-flex items-center justify-center px-6 py-2 rounded-full
                           bg-cyan-500/10 border border-cyan-400/20 text-cyan-200
                           backdrop-blur-sm transition-all
                           hover:bg-cyan-500/20 hover:border-cyan-300/40 hover:text-cyan-100
                           hover:shadow-[0_0_15px_rgba(0,255,255,0.35)]"
                            >
                                More About Me
                            </Link>
                        </div>
                    </div>

                    {/* ---- UPDATED THEMED GET IN TOUCH ---- */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center md:text-left">
                        <h3 className="font-semibold">Get in touch</h3>
                        <p className="text-white/80 mt-2">
                            Open to gameplay programming roles. Let’s talk!
                        </p>

                        <div className="mt-4 flex justify-center md:justify-start gap-4">

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
                    </div>
                </section>
            </div>
        </>
    )
}
