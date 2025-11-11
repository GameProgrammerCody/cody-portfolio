import Link from "next/link";
import SmartImage from "./SmartImage";

export default function ProjectCard({ project }) {
    if (!project) return null;

    const { slug, title, blurb, tags = [], media } = project;

    return (
        <Link
            href={`/projects/${slug}`}
            scroll={false}
            className="group block rounded-2xl border border-white/10 bg-black/30 overflow-hidden flex flex-col
        transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(0,255,255,0.25)]
        hover:border-cyan-400/40 hover:bg-black/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
        >
            {/* --- Hero Image --- */}
            <SmartImage
                slug={slug}
                base="hero"
                alt={title}
                className="aspect-video w-full bg-black transition-[filter,transform] duration-300 group-hover:brightness-110"
            />

            {/* --- Content --- */}
            <div className="p-4 flex-1 flex flex-col items-center text-center">
                {/* --- Title Image --- */}
                <div className="relative w-full h-12 flex items-center justify-center mb-2">
                    <SmartImage
                        slug={slug}
                        base="title"
                        alt={title}
                        className="w-full h-full"
                    />
                </div>

                {/* --- Fallback Text Title --- */}
                {!media?.titleLogo && (
                    <h3 className="font-semibold text-center mt-2 transition-colors group-hover:text-cyan-300">
                        {title}
                    </h3>
                )}

                {/* --- Blurb --- */}
                {blurb && (
                    <p className="text-sm text-white/75 mt-2 flex-1">{blurb}</p>
                )}

                {/* --- Tags --- */}
                {tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1 justify-center">
                        {tags.map((t) => (
                            <span
                                key={t}
                                className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10"
                            >
                                {t}
                            </span>
                        ))}
                    </div>
                )}

                {/* --- View Project Button --- */}
                <div
                    className="mt-4 relative inline-flex items-center justify-center px-4 py-2 rounded-xl font-medium
            text-cyan-300 border border-cyan-400/40 bg-black/30
            overflow-hidden transition-all duration-300 hover:text-white hover:shadow-[0_0_20px_rgba(0,255,255,0.25)]
            hover:animate-[pulseGlow_2s_ease-in-out_infinite]"
                >
                    <span
                        className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 
              group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none"
                    ></span>

                    <span className="relative z-10">View Project</span>

                    <span
                        className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 to-blue-500 
              scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full"
                    ></span>
                </div>
            </div>

            {/* --- Local keyframes --- */}
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
    );
}
