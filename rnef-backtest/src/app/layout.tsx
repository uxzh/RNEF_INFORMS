import type { Metadata } from 'next'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppShell } from '@/components/layout/AppShell'
import './globals.css'

export const metadata: Metadata = {
  title: 'RNEF Analytics — Backtesting',
  description: 'Rice Renewable Energy Fund — Backtesting & Strategy Analysis',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TooltipProvider>
          <AppShell>
            {children}
          </AppShell>
        </TooltipProvider>
      </body>
    </html>
  )
}
