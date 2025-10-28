"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"

type BlogMeta = {
  slug: string
  title: string
  date: string
  file: string
  excerpt?: string
  tags?: string[]
}

type BlogIndex = {
  posts: BlogMeta[]
}

const jsonFetcher = (url: string) => fetch(url).then((r) => r.json())

export default function BlogsPage() {
  const { data, error } = useSWR<BlogIndex>("/data/blogs/index.json", jsonFetcher, { revalidateOnFocus: false })
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [readTimes, setReadTimes] = useState<Record<string, number>>({})

  const posts = useMemo(
    () =>
      (data?.posts || [])
        .filter((p) => p?.slug && p?.file)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [data],
  )

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    posts.forEach((p) => {
      p.tags?.forEach((tag) => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [posts])

  const filteredPosts = useMemo(
    () => (selectedTag ? posts.filter((p) => p.tags?.includes(selectedTag)) : posts),
    [posts, selectedTag],
  )

  useEffect(() => {
    let cancelled = false
    async function compute() {
      const entries = await Promise.all(
        filteredPosts.map(async (p) => {
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
    if (filteredPosts.length) compute()
    return () => {
      cancelled = true
    }
  }, [filteredPosts])

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <p className="text-muted-foreground">Failed to load posts.</p>
      </main>
    )
  }
  if (!data) {
    return (
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 md:px-8 lg:px-16 py-12 sm:py-16 lg:py-20">
      <div className="mb-6 sm:mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to home
        </Link>
      </div>

      <header className="mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight text-foreground">
          Writeups & Blogs
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground">All posts, sorted by most recent.</p>
      </header>

      <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
        <button
          onClick={() => setSelectedTag(null)}
          className={`px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs border rounded-full transition-colors duration-300 ${
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
            className={`px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs border rounded-full transition-colors duration-300 ${
              selectedTag === tag
                ? "border-foreground bg-foreground text-background"
                : "border-border hover:border-muted-foreground/50"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
        {filteredPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block rounded-lg border border-border p-4 sm:p-6 transition-colors hover:bg-muted"
            aria-label={`Open ${post.title}`}
          >
            <h3 className="text-lg sm:text-xl font-medium text-foreground group-hover:underline">{post.title}</h3>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
              {new Date(post.date).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
              {readTimes[post.slug] ? ` • ${readTimes[post.slug]} min read` : ""}
            </p>
            {post.excerpt ? <p className="mt-3 text-xs sm:text-sm text-muted-foreground">{post.excerpt}</p> : null}
          </Link>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No posts found for this tag.</p>
        </div>
      )}
    </main>
  )
}
