// src/components/SmartImage.js
import { useEffect, useState } from "react";
import Image from "next/image";

export default function SmartImage({
    slug,
    base = "hero",
    isHeroPage = false,    // parent tells us if this is the hero on a project page
    className = "",
    imgClassName = "",
    alt = ""
}) {
    const [hydrated, setHydrated] = useState(false);
    const [loaded, setLoaded] = useState(false);

    // Ensure hydration happens before we fade-in images
    useEffect(() => {
        setHydrated(true);
    }, []);

    const isHero = isHeroPage && base === "hero";
    const prefix = `/assets/${slug}/${base}`;

    // Responsive sizes (unchanged)
    const responsiveSizes = isHero
        ? "(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
        : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 400px";

    // srcset generator (unchanged)
    const buildSrcSet = (format) =>
        isHero
            ? [
                `${prefix}@600.${format} 600w`,
                `${prefix}@1200.${format} 1200w`,
                `${prefix}.${format} 1600w`,
            ].join(", ")
            : [
                `${prefix}@600.${format} 600w`,
                `${prefix}.${format} 800w`,
            ].join(", ");

    // object-fit rule
    const fitClass =
        base === "title"
            ? "object-contain"
            : "object-cover";

    // Hydration-safe fade logic
    const fadeClass =
        hydrated && loaded
            ? "opacity-100"
            : "opacity-0";

    return (
        <div className={`relative w-full h-full overflow-hidden ${className}`}>
            <picture>
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
                    src={`${prefix}.jpg`}
                    alt={alt || slug}
                    fill
                    sizes={responsiveSizes}
                    priority={isHero}
                    loading={isHero ? "eager" : "lazy"}
                    fetchPriority={isHero ? "high" : "auto"}
                    decoding="async"
                    className={`${fitClass} transition-opacity duration-700 ease-out ${fadeClass} ${imgClassName}`}
                    onLoadingComplete={() => setLoaded(true)}
                />
            </picture>
        </div>
    );
}
