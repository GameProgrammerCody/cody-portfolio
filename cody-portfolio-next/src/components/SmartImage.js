import { useEffect, useState } from "react";
import Image from "next/image";

export default function SmartImage({ slug, base = "hero", className = "", alt = "" }) {
    const [loaded, setLoaded] = useState(false);

    // --- Responsive size hints ---
    const responsiveSizes =
        base === "hero"
            ? "(max-width: 640px) 100vw, (max-width: 1024px) 90vw, (max-width: 1536px) 70vw, 1200px"
            : "(max-width: 640px) 100vw, (max-width: 1024px) 80vw, (max-width: 1536px) 50vw, 800px";

    // --- Helper to build responsive sets ---
    const buildSrcSet = (format) =>
        [
            `/assets/${slug}/${base}@600.${format} 600w`,
            `/assets/${slug}/${base}@1200.${format} 1200w`,
            `/assets/${slug}/${base}.${format} 1600w`,
        ].join(", ");

    return (
        <div className={`relative w-full h-full overflow-hidden ${className}`}>
            <picture>
                {/* ✅ No fetch delay — directly reference known files */}
                <source
                    type="image/avif"
                    srcSet={buildSrcSet("avif")}
                    sizes={responsiveSizes}
                />
                <source
                    type="image/webp"
                    srcSet={buildSrcSet("webp")}
                    sizes={responsiveSizes}
                />
                <Image
                    src={`/assets/${slug}/${base}.jpg`}
                    alt={alt || slug}
                    fill
                    sizes={responsiveSizes}
                    priority={base === "hero"} // preload hero automatically
                    loading={base === "hero" ? "eager" : "lazy"}
                    decoding="async"
                    className={`object-contain transition-opacity duration-700 ease-out ${loaded ? "opacity-100" : "opacity-0"
                        }`}
                    onLoad={() => setLoaded(true)}
                />
            </picture>
        </div>
    );
}
