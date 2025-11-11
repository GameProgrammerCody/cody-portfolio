import { useEffect, useState } from "react";
import Image from "next/image";

export default function SmartImage({ slug, base = "hero", className = "", alt = "" }) {
    const [available, setAvailable] = useState({
        avif: false,
        webp: false,
        fallback: false,
    });
    const [fallbackSrc, setFallbackSrc] = useState(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const formats = [
            { key: "avif", path: `/assets/${slug}/${base}.avif` },
            { key: "webp", path: `/assets/${slug}/${base}.webp` },
            { key: "fallback", path: `/assets/${slug}/${base}.png` },
            { key: "fallback", path: `/assets/${slug}/${base}.jpg` },
            { key: "fallback", path: `/assets/${slug}/${base}.jpeg` },
        ];

        const checkImages = async () => {
            const found = { avif: false, webp: false, fallback: false };
            for (const f of formats) {
                try {
                    const res = await fetch(f.path, { method: "HEAD" });
                    if (res.ok) {
                        found[f.key] = true;
                        if (f.key === "fallback" && !fallbackSrc) setFallbackSrc(f.path);
                    }
                } catch {
                    // ignore
                }
            }
            setAvailable(found);
        };

        checkImages();
    }, [slug, base]);

    // --- Fallback gradient if no image found ---
    if (!available.avif && !available.webp && !available.fallback) {
        return (
            <div
                className={`w-full h-full bg-gradient-to-br from-cyan-500/10 to-transparent ${className}`}
            />
        );
    }

    // --- Responsive size hints for browser ---
    const responsiveSizes =
        base === "hero"
            ? "(max-width: 640px) 100vw, (max-width: 1024px) 90vw, (max-width: 1536px) 70vw, 1200px"
            : "(max-width: 640px) 100vw, (max-width: 1024px) 80vw, (max-width: 1536px) 50vw, 800px";

    // --- Build srcSets dynamically ---
    const buildSrcSet = (format) =>
        [
            `/assets/${slug}/${base}@600.${format} 600w`,
            `/assets/${slug}/${base}@1200.${format} 1200w`,
            `/assets/${slug}/${base}.${format} 1600w`,
        ].join(", ");

    return (
        <div className={`relative w-full h-full overflow-hidden ${className}`}>
            <picture>
                {available.avif && (
                    <source
                        type="image/avif"
                        srcSet={buildSrcSet("avif")}
                        sizes={responsiveSizes}
                    />
                )}
                {available.webp && (
                    <source
                        type="image/webp"
                        srcSet={buildSrcSet("webp")}
                        sizes={responsiveSizes}
                    />
                )}

                <Image
                    src={fallbackSrc || `/assets/${slug}/${base}.png`}
                    alt={alt || slug}
                    fill
                    sizes={responsiveSizes}
                    priority={base === "hero"}
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
