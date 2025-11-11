// src/components/SmartImage.js
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";

export default function SmartImage({
    slug,
    base = "hero",
    className = "",        // wrapper classes (parent must give height)
    imgClassName = "",     // optional extra classes for the <Image/>
    alt = ""
}) {
    const router = useRouter();
    const [loaded, setLoaded] = useState(false);
    const [isHero, setIsHero] = useState(false);

    // Detect project detail page for LCP behavior
    useEffect(() => {
        setIsHero(base === "hero" && router.pathname.includes("/projects/"));
    }, [router.pathname, base]);

    const prefix = `/assets/${slug}/${base}`;

    // Sizes: hero is large (detail pages), others are smaller
    const responsiveSizes = isHero
        ? "(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
        : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 400px";

    // Build srcset for @600/@1200/full variants
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

    // 🔧 Key fix: choose the right object-fit automatically
    const fitClass = base === "title" ? "object-contain" : "object-cover";

    return (
        <div className={`relative w-full h-full overflow-hidden ${className}`}>
            <picture>
                <source type="image/avif" srcSet={buildSrcSet("avif")} sizes={responsiveSizes} />
                <source type="image/webp" srcSet={buildSrcSet("webp")} sizes={responsiveSizes} />
                <Image
                    src={`${prefix}.jpg`}                 // fallback format
                    alt={alt || slug}
                    fill                                   // requires parent with position:relative and a real height
                    sizes={responsiveSizes}
                    priority={isHero}
                    loading={isHero ? "eager" : "lazy"}
                    fetchPriority={isHero ? "high" : "auto"}
                    decoding="async"
                    className={`${fitClass} transition-opacity duration-700 ease-out ${loaded ? "opacity-100" : "opacity-0"} ${imgClassName}`}
                    onLoad={() => setLoaded(true)}
                />
            </picture>
        </div>
    );
}
