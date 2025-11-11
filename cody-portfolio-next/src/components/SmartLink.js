import Link from 'next/link'

export default function SmartLink({ children, ...props }) {
    return (
        <Link scroll={false} {...props}>
            {children}
        </Link>
    )
}
