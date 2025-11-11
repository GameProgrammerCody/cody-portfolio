import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";

export default function SmartImage({ slug, base = "hero", className = "", alt = "" }) {
    const router = useRouter();
    const [loaded, setLoaded] = useState(false);
    const [isHero, setIsHero] = useState(false);

    useEffect(() => {
        setIsHero(base === "hero" && router.pathname.includes("/projects/"));
    }, [router.pathname, base]);

    const prefix = `/assets/${slug}/${base}`;

    const responsiveSizes = isHero
        ? "(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
        : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 400px";

    const buildSrcSet = (format) =>
        isHero
            ? [
                `${prefix}@600.${format} 600w`,
                `${prefix}@1200.${format} 1200w`,
                `${prefix}.${format} 1600w`,
            ].join(", ")
            : [`${prefix}@600.${format} 600w`, `${prefix}.${format} 800w`].join(", ");

    // 🔑 choose fit: hero = cover, title = contain
    const fitClass = base === "title" ? "object-contain" : "object-cover";

    return (
        <div className={`relative overflow-hidden ${className}`}>
            <picture className="absolute inset-0 block">
                <source type="image/avif" srcSet={buildSrcSet("avif")} sizes={responsiveSizes} />
                <source type="image/webp" srcSet={buildSrcSet("webp")} sizes={responsiveSizes} />
                <Image
                    src={`${prefix}.jpg`}
                    alt={alt || slug}
                    fill
                    sizes={responsiveSizes}
                    priority={isHero}
                    loading={isHero ? "eager" : "lazy"}
                    fetchPriority={isHero ? "high" : "auto"}
                    decoding="async"
                    className={`${fitClass} transition-opacity duration-700 ease-out ${loaded ? "opacity-100" : "opacity-0"}`}
                    onLoad={() => setLoaded(true)}
                />
            </picture>
        </div>
    );
}
