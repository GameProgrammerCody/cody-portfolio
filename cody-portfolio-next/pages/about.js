import { useEffect, useRef, useState } from 'react'

function FadeInSection({ children, delay = 0 }) {
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
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      {children}
    </div>
  )
}

export default function About() {
  const skills = [
    'Unity3D',
    'C#',
    'C++',
    'Unreal Engine',
    'Git',
    'AI Systems',
    'Shaders',
    'Profiling',
  ]
  const learning = [
    'Multiplayer Networking',
    'Advanced AI Behaviours',
    'Game Optimization',
  ]

  return (
    <>
      <section className="max-w-5xl mx-auto grid md:grid-cols-3 gap-10 items-start">
        {/* --- Left column: bio and highlights --- */}
        <div className="md:col-span-2 space-y-6">
          <FadeInSection>
            <h1 className="text-5xl md:text-3xl font-display font-bold animated-gradient">About Me</h1>
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-transparent p-6 
                            transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,255,255,0.15)] hover:border-cyan-400/40">
              <p className="text-white/80 mb-3">
                I’m <strong className="text-cyan-300">Cody Way</strong>, a passionate{' '}
                <strong>game programmer</strong> who thrives on building immersive gameplay systems and smooth player experiences. 
                I specialize in <strong>Unity3D</strong>, <strong>C#</strong>, and{' '}
                <strong>AI-driven design</strong>, focusing on code that feels both elegant and performant.
              </p>
              <p className="text-white/80 mb-3">
                I enjoy the challenge of turning creative ideas into interactive mechanics — whether it’s refining combat flow, crafting AI behaviors, or creating the internal tools that empower teams to work faster and smarter.
              </p>
              <p className="text-white/80">
                <strong>BSc (Hons) Games Programming</strong> — Bournemouth University
              </p>
            </div>
          </FadeInSection>

          <FadeInSection delay={200}>
            <h2 className="text-2xl font-display font-semibold gradient-text mb-4">Currently Learning</h2>
            <div className="flex flex-wrap gap-2">
              {learning.map((l) => (
                <span
                  key={l}
                  className="text-xs px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-200"
                >
                  {l}
                </span>
              ))}
            </div>
          </FadeInSection>

          <FadeInSection delay={400}>
            <h2 className="text-2xl font-display font-semibold gradient-text mb-4">Get in Touch</h2>
            <p className="text-white/80 mb-4">
              I’m always open to collaboration on exciting projects, gameplay systems, or AI-driven features.  
              <br />
              Reach out anytime:
              <br />
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

            <a
              href="/resume/Cody_Way_Resume.pdf"
              className="inline-block btn btn-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download Resume
            </a>
          </FadeInSection>

          {/* --- Fun Facts Section --- */}
          <FadeInSection delay={600}>
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-transparent p-6 
                            transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,255,255,0.15)] hover:border-cyan-400/40">
              <h2 className="text-2xl font-semibold mb-3">Beyond Programming</h2>
              <p className="text-white/80">
                Outside of game development, I enjoy exploring retro games, experimenting with sci-fi art, and researching interactive storytelling techniques.  
                These creative outlets help me bring fresh ideas and perspectives into every project I build.
              </p>
            </div>
          </FadeInSection>
        </div>

        {/* --- Right column: profile & skills --- */}
        <FadeInSection delay={300}>
          <aside className="space-y-6">
            {/* Profile / Avatar */}
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 p-4 flex justify-center">
     <div
  className="w-36 h-36
 rounded-full overflow-hidden border border-cyan-400/20 bg-white/5
             animate-[fadeRotate_0.8s_ease-out_forwards] glowPulse hover:brightness-125"
>
  <img
    src="/assets/logo-cw.png"
    alt="Cody Way Logo"
    className="w-full h-full object-contain"
  />
</div>

            </div>

            {/* Skills */}
            <div>
              <h2 className="text-2xl font-display font-semibold gradient-text mb-4">Core Skills</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </FadeInSection>
      </section>

      {/* Custom keyframes */}
      <style jsx>{`
        @keyframes fadeRotate {
          0% {
            opacity: 0;
            transform: translateY(10px) rotate(-15deg) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateY(0) rotate(0deg) scale(1);
          }
        }

        @keyframes glowPulse {
          0%, 100% {
            box-shadow: 0 0 10px rgba(0, 255, 255, 0.3),
                        0 0 20px rgba(0, 255, 255, 0.15);
          }
          50% {
            box-shadow: 0 0 25px rgba(0, 255, 255, 0.4),
                        0 0 50px rgba(0, 255, 255, 0.2);
          }
        }

        .glowPulse {
          animation: glowPulse 4s ease-in-out infinite alternate;
        }
      `}</style>
    </>
  )
}
