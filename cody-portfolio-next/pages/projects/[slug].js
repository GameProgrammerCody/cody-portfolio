import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import data from '../../src/data/projects.json'
import SmartImage from '../../src/components/SmartImage'

const youtubeId = (url) => {
    if (!url) return null
    const m = url.match(/(?:v=|youtu\.be\/)([\w-]{11})/)
    return m ? m[1] : null
}

export default function Project() {
    const router = useRouter()
    const { slug } = router.query
    const [project, setProject] = useState(null)
    const [idx, setIdx] = useState(-1)
    const [lightbox, setLightbox] = useState({ open: false, index: 0 })
    const [visible, setVisible] = useState(false)
    const [fadeImage, setFadeImage] = useState(false)
    const [direction, setDirection] = useState('next')
    const containerRef = useRef(null)

    // --- Filter only visible projects ---
    const visibleProjects = data.projects.filter(p => p.visible !== false)

    // Smooth fade between projects
    useEffect(() => {
        if (!slug) return
        if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual'
        }

        setVisible(false)
        const timer = setTimeout(() => {
            const i = visibleProjects.findIndex((p) => p.slug === slug)
            if (i >= 0) {
                setIdx(i)
                setProject(visibleProjects[i])
            }
            setTimeout(() => {
                setVisible(true)
                //window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 100)
        }, 200)

        return () => clearTimeout(timer)
    }, [slug])

    // Scroll-triggered animations
    useEffect(() => {
        if (!project) return
        const elements = document.querySelectorAll('.fade-up-stagger')
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry, i) => {
                    if (entry.isIntersecting) {
                        entry.target.style.animationDelay = `${i * 0.1}s`
                        entry.target.classList.add('animate')
                        observer.unobserve(entry.target)
                    }
                })
            },
            { threshold: 0.15 }
        )
        elements.forEach((el) => observer.observe(el))
        return () => observer.disconnect()
    }, [project])

    // Keyboard navigation for lightbox
    useEffect(() => {
        if (!lightbox.open) return

        const handleKey = (e) => {
            if (e.key === 'Escape') {
                setLightbox({ open: false, index: 0 })
            } else if (e.key === 'ArrowLeft') {
                handlePrev()
            } else if (e.key === 'ArrowRight') {
                handleNext()
            }
        }

        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [lightbox.open, project])

    const handlePrev = () => {
        if (!project?.media?.gallery?.length) return
        setDirection('prev')
        setFadeImage(true)
        setTimeout(() => {
            setLightbox((prev) => ({
                ...prev,
                index:
                    (prev.index - 1 + project.media.gallery.length) %
                    project.media.gallery.length,
            }))
            setFadeImage(false)
        }, 220)
    }

    const handleNext = () => {
        if (!project?.media?.gallery?.length) return
        setDirection('next')
        setFadeImage(true)
        setTimeout(() => {
            setLightbox((prev) => ({
                ...prev,
                index: (prev.index + 1) % project.media.gallery.length,
            }))
            setFadeImage(false)
        }, 220)
    }

    if (!slug || !project)
        return <p className="p-10 text-center text-white/60">Loading…</p>

    // --- Prev / Next ignoring hidden projects ---
    const prev = idx > 0 ? visibleProjects[idx - 1] : null
    const next =
        idx >= 0 && idx < visibleProjects.length - 1
            ? visibleProjects[idx + 1]
            : null

    const id = youtubeId(project?.links?.video)

    return (
        <article
            ref={containerRef}
            className={`transition-all duration-700 ease-out transform ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
        >
            {/* Back link */}
            <Link href="/projects" className="text-sm text-cyan-300 hover:underline fade-up-stagger">
                ← Back to Projects
            </Link>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-black mt-4 text-center drop-shadow-[0_0_15px_rgba(0,255,255,0.25)] fade-up-stagger">
                <SmartImage
                    slug={project.slug}
                    base="title"
                    className="max-h-24 object-contain mx-auto"
                    alt={project.title}
                />
            </h1>

            {/* Hero image */}
            <div className="mt-6 aspect-video rounded-2xl overflow-hidden border border-cyan-400/10 bg-black/50 relative group fade-up-stagger">
                <SmartImage
                    slug={project.slug}
                    base="hero"
                    className="w-full h-full object-contain bg-black transition-transform duration-700 group-hover:scale-[1.02]"
                    alt={project.title}
                />
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 blur-2xl" />
            </div>

            {/* Tags */}
            <div className="mt-6 flex flex-wrap gap-2 justify-center text-sm fade-up-stagger">
                {(project.tags || []).map((t) => (
                    <span key={t} className="px-2 py-1 rounded-full bg-white/5 border border-white/10">
                        {t}
                    </span>
                ))}
                {(project.platforms || []).map((p) => (
                    <span key={p} className="px-2 py-1 rounded-full bg-white/5 border border-white/10">
                        {p}
                    </span>
                ))}
            </div>

            {/* Sections */}
            {project.sections && project.sections.length > 0 && (
                <section className="mt-12 space-y-8">
                    {project.sections.map((section, i) => (
                        <div key={i} className="max-w-4xl mx-auto px-4 fade-up-stagger">
                            <h2
                                className="text-2xl md:text-3xl font-display font-semibold text-center mb-6 
                             bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent
                             drop-shadow-[0_0_12px_rgba(0,255,255,0.2)] tracking-wide"
                            >
                                {section.title}
                            </h2>

                            {section.type === 'text' && (
                                <p className="max-w-3xl mx-auto text-[1.05rem] leading-relaxed text-white/85 text-center fade-up-stagger">
                                    {section.content}
                                </p>
                            )}

                            {section.type === 'list' && (
                                <ul className="list-disc list-inside text-white/80 space-y-2 max-w-3xl mx-auto text-left leading-relaxed">
                                    {section.items.map((item, j) => (
                                        <li key={j} className="fade-up-stagger">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {section.type === 'grid' && (
                                <ul className="grid sm:grid-cols-2 gap-3 text-white/85 max-w-3xl mx-auto">
                                    {section.items.map((item, j) => (
                                        <li
                                            key={j}
                                            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-center fade-up-stagger"
                                        >
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {i < project.sections.length - 1 && (
                                <div className="mt-12 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent opacity-60 fade-up-stagger" />
                            )}
                        </div>
                    ))}
                </section>
            )}

            {/* YouTube embed */}
            {id && (
                <section className="scroll-mt-24 mt-20 fade-up-stagger">
                    <h2 className="text-2xl font-display font-semibold text-cyan-300 mb-6 text-center">
                        Video
                    </h2>
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-cyan-400/10 bg-black/50 max-w-4xl mx-auto">
                        <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${id}`}
                            title="Project video"
                            allowFullScreen
                        />
                    </div>
                </section>
            )}

            {/* Gallery */}
            {project?.media?.gallery?.length > 0 && (
                <section className="scroll-mt-24 mt-20 fade-up-stagger">
                    <h2 className="text-2xl font-display font-semibold text-cyan-300 mb-6 text-center">
                        Gallery
                    </h2>

                    <div className="grid md:grid-cols-3 gap-4 max-w-6xl mx-auto px-4">
                        {project.media.gallery.map((src, i) => (
                            <button
                                key={i}
                                onClick={() => setLightbox({ open: true, index: i })}
                                className="aspect-video rounded-xl border border-white/10 bg-white/5 overflow-hidden 
                           hover:border-cyan-400/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,255,0.15)] fade-up-stagger"
                            >
                                <img
                                    src={src}
                                    alt=""
                                    className="w-full h-full object-contain bg-black transition-transform duration-500 hover:scale-105"
                                />
                            </button>
                        ))}
                    </div>

                    {/* Lightbox */}
                    {lightbox.open && (
                        <div
                            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fadeIn"
                            onClick={() => setLightbox({ open: false, index: 0 })}
                        >
                            <div
                                className="max-w-5xl w-full relative"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <img
                                    src={project.media.gallery[lightbox.index]}
                                    alt=""
                                    className={`w-full rounded-xl shadow-[0_0_25px_rgba(0,255,255,0.3)] transition-all duration-400 ease-out ${fadeImage
                                            ? direction === 'next'
                                                ? 'opacity-0 scale-95 translate-x-6'
                                                : 'opacity-0 scale-95 -translate-x-6'
                                            : 'opacity-100 scale-100 translate-x-0'
                                        }`}
                                />

                                <button
                                    onClick={() => setLightbox({ open: false, index: 0 })}
                                    className="absolute top-4 right-4 text-cyan-300 hover:text-white text-3xl font-bold"
                                >
                                    ✕
                                </button>

                                {project.media.gallery.length > 1 && (
                                    <>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handlePrev()
                                            }}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-300 hover:text-white text-4xl font-bold"
                                        >
                                            ‹
                                        </button>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleNext()
                                            }}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-300 hover:text-white text-4xl font-bold"
                                        >
                                            ›
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </section>
            )}

            {/* Prev / Next (ignores hidden) */}
            <div className="mt-24 flex items-center justify-between text-sm fade-up-stagger max-w-4xl mx-auto px-4">
                <div>
                    {prev ? (
                        <Link
                            href={`/projects/${prev.slug}`}
                            className="inline-flex items-center gap-2 text-cyan-300 hover:text-white transition"
                        >
                            ← {prev.title}
                        </Link>
                    ) : (
                        <span />
                    )}
                </div>
                <div>
                    {next ? (
                        <Link
                            href={`/projects/${next.slug}`}
                            className="inline-flex items-center gap-2 text-cyan-300 hover:text-white transition"
                        >
                            {next.title} →
                        </Link>
                    ) : (
                        <span />
                    )}
                </div>
            </div>

            <style jsx>{`
        .fade-up-stagger {
          opacity: 0;
          transform: translateY(16px);
          transition: all 0.6s ease-out;
        }
        .fade-up-stagger.animate {
          opacity: 1;
          transform: translateY(0);
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.98);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
        </article>
    )
}
