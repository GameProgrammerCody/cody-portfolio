import Link from 'next/link'
import SmartImage from './SmartImage'

export default function ProjectCard({ project: p }) {
    return (
        <Link
            href={`/projects/${p.slug}`}
            className="group block rounded-2xl border border-white/10 bg-black/30 overflow-hidden flex flex-col
                 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(0,255,255,0.25)]
                 hover:border-cyan-400/40 hover:bg-black/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
        >
            {/* Thumbnail / hero area */}
            <div className="aspect-video relative overflow-hidden">
                {/* cyan overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0
                        group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                {/* top vignette for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60 pointer-events-none"></div>

                {/* main image */}
                <SmartImage
                    slug={p.slug}
                    base="hero"
                    className="w-full h-full object-contain bg-black transition-[filter,transform] duration-300 group-hover:brightness-110"
                    alt={p.title}
                />

                {/* ✨ shimmer sweep on hover */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div
                        className="absolute -inset-y-16 -left-1/2 w-1/2
                        rotate-12
                        bg-gradient-to-r from-transparent via-cyan-300/20 to-transparent
                        blur-2xl
                        animate-[shimmer_1600ms_ease-out]"
                    ></div>
                </div>
            </div>

            {/* Text content */}
            <div className="p-4 flex-1 flex flex-col items-center text-center">
                <div className="flex justify-center items-center min-h-[60px]">
                    <SmartImage
                        slug={p.slug}
                        base="title"
                        className="max-h-12 object-contain mx-auto"
                        alt={p.title}
                    />
                </div>

                {!p.media?.titleLogo && (
                    <h3 className="font-semibold text-center mt-2 transition-colors group-hover:text-cyan-300">
                        {p.title}
                    </h3>
                )}

                <p className="text-sm text-white/75 mt-2 flex-1">{p.blurb}</p>

                {/* tags */}
                <div className="mt-2 flex flex-wrap gap-1 justify-center">
                    {(p.tags || []).map((t) => (
                        <span
                            key={t}
                            className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10"
                        >
                            {t}
                        </span>
                    ))}
                </div>

                {/* “View Project” area (pulses on hover) */}
                <div
                    className="mt-4 relative inline-flex items-center justify-center px-4 py-2 rounded-xl font-medium
                     text-cyan-300 border border-cyan-400/40 bg-black/30
                     overflow-hidden transition-all duration-300 hover:text-white hover:shadow-[0_0_20px_rgba(0,255,255,0.25)]
                     hover:animate-[pulseGlow_2s_ease-in-out_infinite]"
                >
                    {/* Soft gradient background */}
                    <span
                        className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 
                       group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none"
                    ></span>

                    {/* Text */}
                    <span className="relative z-10">View Project</span>

                    {/* Animated underline */}
                    <span
                        className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 to-blue-500 
                       scale-x-0 hover:scale-x-100 transition-transform duration-300 origin-left rounded-full"
                    ></span>
                </div>
            </div>

            {/* --- Local CSS keyframes --- */}
            <style jsx>{`
        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 0 rgba(0, 255, 255, 0);
          }
          50% {
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
          }
        }
      `}</style>
        </Link>
    )
}
