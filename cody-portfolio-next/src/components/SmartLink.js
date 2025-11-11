import Link from 'next/link'

/**
 * SmartLink — a drop-in replacement for Next.js <SmartLink>
 * Automatically disables scroll-to-top and merges any passed props.
 */
export default function SmartLink({ children, ...props }) {
  return (
    <SmartLink scroll={false} {...props}>
      {children}
    </SmartLink>
  )
}
