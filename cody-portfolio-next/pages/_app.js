import '../styles/globals.css'
import Layout from '../src/components/Layout'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function MyApp({ Component, pageProps, router }) {
    const [enabled, setEnabled] = useState(true)
    const nextRouter = useRouter()

    // ✅ Disable Next.js auto-scroll
    useEffect(() => {
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual'
        }
    }, [])

    // ✅ Handle reduce motion toggle
    useEffect(() => {
        if (typeof window === 'undefined') return
        const saved = localStorage.getItem('reduceMotion')
        setEnabled(saved !== 'true')

        const handleToggle = (e) => setEnabled(e.detail)
        window.addEventListener('motionToggle', handleToggle)
        return () => window.removeEventListener('motionToggle', handleToggle)
    }, [])

    // ✅ Scroll to top after animation completes
    const handleAnimationComplete = () => {
        // Delay slightly to ensure layout is settled
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'instant' })
        }, 60)
    }

    return (
        <Layout>
            <Head>
                <title>Cody Way — Game Programmer</title>
                <meta
                    name="description"
                    content="Portfolio of Cody Way — Game Programmer specializing in Unity, C#, and AI systems."
                />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#00FFFF" />

                {/* --- Open Graph --- */}
                <meta property="og:title" content="Cody Way — Game Programmer" />
                <meta
                    property="og:description"
                    content="Portfolio of Cody Way — Game Programmer specializing in Unity, C#, and AI systems."
                />
                <meta property="og:image" content="/og-image.png" />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://codyway.dev" />

                {/* --- Twitter --- */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Cody Way — Game Programmer" />
                <meta
                    name="twitter:description"
                    content="Portfolio of Cody Way — Game Programmer specializing in Unity, C#, and AI systems."
                />
                <meta name="twitter:image" content="/og-image.png" />

                <link rel="icon" href="/favicon.png" type="image/png" />
            </Head>

            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={router.asPath}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{
                        duration: enabled ? 0.35 : 0,
                        ease: [0.4, 0, 0.2, 1],
                    }}
                    className="relative z-10 min-h-screen will-change-transform"
                    onAnimationComplete={handleAnimationComplete}
                >
                    <Component {...pageProps} />
                </motion.div>
            </AnimatePresence>
        </Layout>
    )
}
