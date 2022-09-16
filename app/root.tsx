import type { MetaFunction, LinksFunction } from '@remix-run/node'
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react'
import styles from './styles/app.css'

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: styles }]

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  viewport: 'width=device-width,initial-scale=1',
})

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
        <FathomScript />
      </head>
      <body className="flex min-h-screen flex-col antialiased">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

const FathomScript = () => {
  return (
    <script
      id="fathom"
      src="https://thirteen-skilled.whatcdkisit.com/script.js"
      data-site="TTTBKERK"
      data-included-domains="whatcdkisit.com"
      defer
    ></script>
  )
}
