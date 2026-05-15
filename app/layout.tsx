import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { MainLayout } from '@/components/layout/main-layout'
import { SimulationEngine } from '@/components/SimulationEngine'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'NEXARA: Rise of Civilization',
  description: 'Distributed Persistent Civilization Simulation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${mono.variable} font-sans antialiased text-white`}>
        <Providers>
          <SimulationEngine />
          <MainLayout>
             {children}
          </MainLayout>
        </Providers>
      </body>
    </html>
  )
}
