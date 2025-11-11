import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function SmartImage({ slug, base = 'hero', className = '', alt = '' }) {
    const [src, setSrc] = useState(null)
    const [size, setSize] = useState({ width: 800, height: 450 })

    useEffect(() => {
        const exts = ['webp', 'avif', 'png', 'jpg', 'jpeg', 'gif'] // ✅ Try modern formats first

        const findImage = async () => {
            for (const ext of exts) {
                const path = `/assets/${slug}/${base}.${ext}`
                try {
                    const res = await fetch(path, { method: 'HEAD' })
                    if (res.ok) {
                        setSrc(path)
                        return
                    }
                } catch {
                    // ignore
                }
            }
            setSrc(null)
        }

        findImage()
    }, [slug, base])

    // Fallback gradient if image not found
    if (!src) {
        return (
            <div
                className={`w-full h-full bg-gradient-to-br from-cyan-500/10 to-transparent ${className}`}
            />
        )
    }

    // ✅ Use next/image for optimization
    return (
        <div className={`relative w-full h-full ${className}`}>
            <Image
                src={src}
                alt={alt || slug}
                fill
                sizes="(max-width: 768px) 100vw, 800px"
                priority={base === 'hero'}
                loading={base === 'hero' ? 'eager' : 'lazy'}
                decoding="async"
                className="object-contain transition-[filter,transform] duration-300"
                onLoadingComplete={(img) => {
                    setSize({ width: img.naturalWidth, height: img.naturalHeight })
                }}
            />
        </div>
    )
}
