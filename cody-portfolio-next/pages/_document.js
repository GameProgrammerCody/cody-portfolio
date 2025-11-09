import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Favicon */}
        <link rel="icon" type="image/png" href="/favicon.png" />
        {/* Optional: high-resolution Apple touch icon */}
        <link rel="apple-touch-icon" href="/favicon.png" />
        <meta name="theme-color" content="#0ef" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
