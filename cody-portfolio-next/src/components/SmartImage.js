import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";

export default function SmartImage({ slug, base = "hero", className = "", alt = "" }) {
    const router = useRouter();
    const [loaded, setLoaded] = useState(false);
    const [isHero, setIsHero] = useState(false);

    // Determine if we’re on a project detail page (client-only)
    useEffect(() => {
        setIsHero(base === "hero" && router.pathname.includes("/projects/"));
    }, [router.pathname, base]);

    const prefix = `/assets/${slug}/${base}`;

    // Responsive sizing rules
    const responsiveSizes = isHero
        ? "(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
        : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 400px";

    // Build srcset for generated variants (@600, @1200, full)
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

    return (
        <div className={`relative w-full h-full overflow-hidden ${className}`}>
            <picture>
                <source type="image/avif" srcSet={buildSrcSet("avif")} sizes={responsiveSizes} />
                <source type="image/webp" srcSet={buildSrcSet("webp")} sizes={responsiveSizes} />
                <Image
                    src={`${prefix}.jpg`}                  // fallback format
                    alt={alt || slug}
                    fill
                    sizes={responsiveSizes}
                    priority={isHero}                      // preload if LCP
                    loading={isHero ? "eager" : "lazy"}    // eager for LCP only
                    fetchPriority={isHero ? "high" : "auto"} // <-- LCP boost
                    decoding="async"
                    className={`object-cover transition-opacity duration-700 ease-out ${loaded ? "opacity-100" : "opacity-0"
                        }`}
                    onLoad={() => setLoaded(true)}
                />
            </picture>
        </div>
    );
}
