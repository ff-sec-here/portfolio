import type React from "react"
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import IntroVideoOverlay from "@/components/intro-video-overlay"

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
})

export const metadata: Metadata = {
  title: "Felix Macaspac - HubSpot CMS Developer",
  description: "HubSpot CMS Developer from Philippines with 5 years of experience.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body className="font-sans antialiased">
        <IntroVideoOverlay />
        {children}
      </body>
    </html>
  )
}
