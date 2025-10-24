"use client"

import { useMemo, useState, useEffect } from "react"
import useSWR from "swr"
import Link from "next/link"

type BlogMeta = {
  slug: string
  title: string
  date: string
  readTime?: string
  file: string
  excerpt?: string
  tags?: string[]
}

type BlogIndex = {
  posts: BlogMeta[]
}

const fetcherJson = (url: string) => fetch(url).then((r) => r.json())

export default function BlogSection() {
  const { data, error, isLoading } = useSWR<BlogIndex>("/data/blogs/index.json", fetcherJson, {
    revalidateOnFocus: false,
  })
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [readTimes, setReadTimes] = useState<Record<string, number>>({})

  const posts = useMemo(() => {
    if (!data?.posts) return []
    return [...data.posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [data])

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    posts.forEach((p) => {
      p.tags?.forEach((tag) => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [posts])

  const topPosts = useMemo(() => {
    const filtered = selectedTag ? posts.filter((p) => p.tags?.includes(selectedTag)) : posts
    return filtered.slice(0, 4)
  }, [posts, selectedTag])

  useEffect(() => {
    let cancelled = false
    async function compute() {
      const entries = await Promise.all(
        topPosts.map(async (p) => {
          try {
            const txt = await fetch(p.file).then((r) => r.text())
            const words = txt.trim().split(/\s+/).length
            const minutes = Math.max(1, Math.ceil(words / 200))
            return [p.slug, minutes] as const
          } catch {
            return [p.slug, 0] as const
          }
        }),
      )
      if (!cancelled) setReadTimes(Object.fromEntries(entries))
    }
    if (topPosts.length) compute()
    return () => {
      cancelled = true
    }
  }, [topPosts])

  if (error) {
    return (
      <div className="text-sm text-muted-foreground border border-border rounded-lg p-6">
        Failed to load blogs. Ensure /public/data/blogs/index.json exists.
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-40 sm:h-48 border border-border rounded-lg animate-pulse bg-muted/20" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedTag(null)}
          className={`px-3 py-1 text-xs border rounded-full transition-colors duration-300 ${
            selectedTag === null
              ? "border-foreground bg-foreground text-background"
              : "border-border hover:border-muted-foreground/50"
          }`}
        >
          All
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-3 py-1 text-xs border rounded-full transition-colors duration-300 ${
              selectedTag === tag
                ? "border-foreground bg-foreground text-background"
                : "border-border hover:border-muted-foreground/50"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
        {topPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block p-6 sm:p-8 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-500 hover:shadow-lg"
            aria-label={`Open ${post.title}`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                <span>
                  {new Date(post.date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span>{readTimes[post.slug] ? `${readTimes[post.slug]} min read` : ""}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-medium group-hover:text-muted-foreground transition-colors duration-300">
                {post.title}
              </h3>
              {post.excerpt ? <p className="text-muted-foreground leading-relaxed">{post.excerpt}</p> : null}
              <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                <span>Read more</span>
                <svg
                  className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex justify-center pt-4">
        <Link
          href="/blogs"
          className="px-6 py-2 text-sm border border-border rounded-lg hover:border-muted-foreground/50 transition-colors duration-300"
        >
          View all blog posts
        </Link>
      </div>
    </div>
  )
}
