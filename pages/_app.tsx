import 'tailwindcss/tailwind.css'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import * as Fathom from 'fathom-client'

function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  useEffect(() => {
    // Initialize Fathom when the app loads
    Fathom.load('TTTBKERK', {
      includedDomains: ['whatcdkisit.vercel.app'],
    })

    function onRouteChangeComplete() {
      Fathom.trackPageview()
    }

    // Record a pageview when route changes
    router.events.on('routeChangeComplete', onRouteChangeComplete)

    // Unassign event listener
    return () => {
      router.events.off('routeChangeComplete', onRouteChangeComplete)
    }
  }, [router.events])

  return <Component {...pageProps} />
}

export default App
