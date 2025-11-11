import { useEffect, useState } from "react";
import Image from "next/image";

export default function SmartImage({ slug, base = "hero", className = "", alt = "" }) {
    const [available, setAvailable] = useState({ avif: false, webp: false, fallback: false });
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

    return (
        <div className={`relative w-full h-full overflow-hidden ${className}`}>
            <picture>
                {available.avif && <source srcSet={`/assets/${slug}/${base}.avif`} type="image/avif" />}
                {available.webp && <source srcSet={`/assets/${slug}/${base}.webp`} type="image/webp" />}
                <Image
                    src={fallbackSrc || `/assets/${slug}/${base}.png`}
                    alt={alt || slug}
                    fill
                    sizes="(max-width: 768px) 100vw, 800px"
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
