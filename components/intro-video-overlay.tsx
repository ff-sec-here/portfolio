"use client"

import { useEffect, useRef, useState } from "react"

export default function IntroVideoOverlay() {
  const [visible, setVisible] = useState(true)
  const [isReady, setIsReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    try {
      const seen = localStorage.getItem("introVideoSeen")
      if (seen === "true") {
        setVisible(false)
      }
    } catch {
      // ignore SSR / storage errors
    }
  }, [])

  // Hide when finished and persist
  const markSeenAndClose = () => {
    try {
      localStorage.setItem("introVideoSeen", "true")
    } catch {
      // ignore
    }
    setVisible(false)
  }

  const handlePlayWithSound = async () => {
    const v = videoRef.current
    if (!v) return
    try {
      v.muted = false
      await v.play()
      setIsReady(true)
    } catch (err) {
      console.log("[v0] Video play error:", (err as Error).message)
      // If autoplay with sound is blocked, show controls so user can interact
      v.controls = true
    }
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Intro Video"
      className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm"
    >
      <div className="h-full w-full flex items-center justify-center p-4">
        <div className="w-full max-w-4xl rounded-lg border bg-background shadow-lg overflow-hidden">
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full aspect-video"
              src="/videos/ai-developer.mp4"
              preload="auto"
              playsInline
              // Note: autoplay with sound requires user gesture; we start after button click
              onEnded={markSeenAndClose}
              onCanPlay={() => setIsReady(true)}
            />
            {/* Controls Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
              <button
                onClick={handlePlayWithSound}
                className="px-6 py-3 rounded-md bg-primary text-primary-foreground transition-colors hover:opacity-90"
                aria-label="Play intro video with sound"
              >
                {isReady ? "Play with sound" : "Loading video..."}
              </button>
              <button
                onClick={markSeenAndClose}
                className="text-sm underline text-muted-foreground hover:text-foreground"
                aria-label="Skip intro"
              >
                Skip
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground">Generative AI Developer – intro reel</p>
            <button
              onClick={markSeenAndClose}
              className="text-sm underline text-muted-foreground hover:text-foreground"
              aria-label="Close intro"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
