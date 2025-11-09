import { useEffect, useState } from 'react'

export default function SmartImage({ slug, base = 'hero', className = '', alt = '' }) {
  const [src, setSrc] = useState(null)

  useEffect(() => {
    const exts = ['png', 'jpg', 'jpeg', 'gif', 'webp']

	console.log("SmartImage is trying:", slug, base)

    const findImage = async () => {
      for (const ext of exts) {
        const path = `/assets/${slug}/${base}.${ext}`
        try {
          const res = await fetch(path, { method: 'HEAD' })
          if (res.ok) {
            setSrc(path)
            return
          }
        } catch (e) {
          // ignore missing files
        }
      }
      setSrc(null)
    }

    findImage()
  }, [slug, base])

  // Show fallback gradient if no image found
  if (!src) {
    return (
      <div
        className={`w-full h-full bg-gradient-to-br from-cyan-500/10 to-transparent ${className}`}
      />
    )
  }

  return <img src={src} alt={alt} className={className} />
}
