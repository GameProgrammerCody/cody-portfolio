import { useRouter } from 'next/router'

export default function SmartLink({ href, children, className, ...props }) {
    const router = useRouter()

    const handleClick = (e) => {
        // Allow normal middle/right click
        if (e.metaKey || e.ctrlKey || e.button !== 0) return
        e.preventDefault()

        // Trigger global fade-out
        document.body.classList.add('page-fade-out')

        // Wait for fade duration (match _app.js transition)
        setTimeout(() => {
            router.push(href)
            document.body.classList.remove('page-fade-out')
        }, 350) // same as duration in _app.js
    }

    return (
        <a href={href} onClick={handleClick} className={className} {...props}>
            {children}
        </a>
    )
}
