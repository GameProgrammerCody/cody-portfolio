import { useEffect, useState } from 'react'
import data from '../src/data/projects.json'
import Link from 'next/link'
import ProjectCard from '../src/components/ProjectCard'

export default function Home() {
  const [isVisible, setIsVisible] = useState(false)
  const featured = data.projects.filter((p) => p.featured)

  useEffect(() => {
    // slight delay for a smoother fade
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <div
        className={`transition-all duration-1000 ease-out transform ${
          isVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-4'
        }`}
      >
        {/* ---- Hero Section ---- */}
        <section className="text-center py-10">
<h1
  className="text-5xl md:text-7xl font-display font-bold animated-gradient leading-[1.1] pb-2"
>
  Game Programmer
</h1>
<p className="mt-4 text-white/80 max-w-2xl mx-auto leading-relaxed font-sans">
  Specializing in gameplay systems, Unity3D, and AI. I build polished, performant player experiences across mobile and desktop.
</p>


          <div className="mt-6 flex justify-center gap-3">
            <Link href="/projects" className="btn btn-primary">
              View Projects
            </Link>
            <Link href="/resume" className="btn btn-ghost">
              Download Resume
            </Link>
          </div>
        </section>

        {/* ---- Featured Projects ---- */}
        <section className="mt-12">
<h2 className="text-2xl font-display font-semibold gradient-text mb-4">
  Featured Projects
</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {featured.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        </section>

        {/* ---- About Preview ---- */}
        <section className="mt-14 grid md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-display font-semibold gradient-text mb-4">About Me</h2>
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
            <div className="mt-6">
              <Link href="/about" className="btn btn-ghost">
                More About Me
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h4 className="font-semibold">Get in touch</h4>
            <p className="text-white/80 mt-2">
              Open to gameplay programming roles. Let’s talk!
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href="mailto:gameprogrammercody@gmail.com"
                className="btn btn-primary"
              >
                Email Me
              </a>
              <a
                href="https://linkedin.com/in/cody-way"
                className="btn btn-ghost"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
