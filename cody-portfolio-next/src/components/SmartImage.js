import { useState } from "react";
import Image from "next/image";

export default function SmartImage({ slug, base = "hero", className = "", alt = "" }) {
    const [loaded, setLoaded] = useState(false);

    // --- Decide whether this image is a true hero or just a card preview ---
    const isHero = base === "hero" && window?.location?.pathname.includes("/projects/");
    const prefix = `/assets/${slug}/${base}`;

    // --- Responsive sizing rules ---
    const responsiveSizes = isHero
        ? "(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
        : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 400px";

    // --- Choose smaller variants for cards ---
    const buildSrcSet = (format) =>
        isHero
            ? [`${prefix}@600.${format} 600w`, `${prefix}@1200.${format} 1200w`, `${prefix}.${format} 1600w`].join(", ")
            : [`${prefix}@600.${format} 600w`, `${prefix}.${format} 800w`].join(", ");

    return (
        <div className={`relative w-full h-full overflow-hidden ${className}`}>
            <picture>
                <source type="image/avif" srcSet={buildSrcSet("avif")} sizes={responsiveSizes} />
                <source type="image/webp" srcSet={buildSrcSet("webp")} sizes={responsiveSizes} />
                <Image
                    src={`${prefix}.jpg`}
                    alt={alt || slug}
                    fill
                    sizes={responsiveSizes}
                    priority={isHero}
                    loading={isHero ? "eager" : "lazy"}
                    decoding="async"
                    className={`object-cover transition-opacity duration-700 ease-out ${loaded ? "opacity-100" : "opacity-0"
                        }`}
                    onLoad={() => setLoaded(true)}
                />
            </picture>
        </div>
    );
}
