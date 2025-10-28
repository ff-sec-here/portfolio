"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import useSWR from "swr"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useMemo } from "react"

type BlogMeta = {
  slug: string
  title: string
  date: string
  readTime?: string
  file: string
  excerpt?: string
  sourceUrl?: string
}

type BlogIndex = {
  posts: BlogMeta[]
}

const fetcherJson = (url: string) => fetch(url).then((r) => r.json())
const fetcherText = (url: string) => fetch(url).then((r) => r.text())

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>()
  const router = useRouter()
  const slug = params?.slug

  const { data, error, isLoading } = useSWR<BlogIndex>("/data/blogs/index.json", fetcherJson, {
    revalidateOnFocus: false,
  })

  const post = data?.posts?.find((p) => p.slug === slug) || null
  const { data: markdown, isLoading: mdLoading, error: mdError } = useSWR(post?.file ? post.file : null, fetcherText)

  const computedMinutes = useMemo(() => {
    if (!markdown) return null
    const words = markdown.trim().split(/\s+/).length
    return Math.max(1, Math.ceil(words / 200))
  }, [markdown])

  if (error) {
    return (
      <main className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16 py-20 sm:py-24 animate-fade-in-up">
        <div className="text-sm text-muted-foreground border border-border rounded-lg p-6">
          Failed to load blog index.
        </div>
      </main>
    )
  }

  if (isLoading || !data) {
    return (
      <main className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16 py-20 sm:py-24 animate-fade-in-up">
        <div className="h-8 w-40 border border-border rounded animate-pulse mb-6" />
        <div className="h-6 w-64 border border-border rounded animate-pulse mb-2" />
        <div className="h-6 w-32 border border-border rounded animate-pulse" />
      </main>
    )
  }

  if (!post) {
    return (
      <main className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16 py-20 sm:py-24 animate-fade-in-up">
        <div className="space-y-6">
          <h1 className="text-3xl sm:text-4xl font-light">Post not found</h1>
          <p className="text-muted-foreground">We couldn't find a blog with the slug "{slug}".</p>
          <div>
            <Link
              href="/#blogs"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-md hover:border-muted-foreground/50 transition-colors"
            >
              ← Back to blogs
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 lg:px-16 py-12 sm:py-16 lg:py-20 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-3 text-[10px] sm:text-xs text-muted-foreground font-mono">
            <span>{post.date}</span>
            {computedMinutes ? <span>{computedMinutes} min read</span> : null}
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-pretty">{post.title}</h1>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link
            href="/"
            className="flex-1 sm:flex-none sm:w-auto px-3 py-2 text-xs sm:text-sm border border-border rounded-md hover:border-muted-foreground/50 transition-colors text-center"
            aria-label="Back to home"
          >
            ← Home
          </Link>
        </div>
      </div>

      <article className="space-y-4 sm:space-y-6 lg:space-y-8">
        {mdLoading && <div className="h-40 border border-border rounded animate-pulse" />}
        {mdError && (
          <div className="text-sm text-muted-foreground border border-border rounded-lg p-6">
            Failed to load markdown content.
          </div>
        )}
        {markdown ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ node, ...props }) => (
                <h1
                  className="text-2xl sm:text-3xl lg:text-4xl font-light mt-8 sm:mt-10 mb-3 sm:mb-4 text-pretty"
                  {...props}
                />
              ),
              h2: ({ node, ...props }) => (
                <h2
                  className="text-xl sm:text-2xl lg:text-3xl font-light mt-8 sm:mt-10 mb-3 sm:mb-4 text-pretty"
                  {...props}
                />
              ),
              h3: ({ node, ...props }) => (
                <h3
                  className="text-lg sm:text-xl lg:text-2xl font-medium mt-6 sm:mt-8 mb-2 sm:mb-3 text-pretty"
                  {...props}
                />
              ),
              p: ({ node, ...props }) => (
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed" {...props} />
              ),
              a: ({ node, ...props }) => (
                <a
                  className="underline underline-offset-4 decoration-muted-foreground hover:text-foreground transition-colors break-words"
                  {...props}
                />
              ),
              ul: ({ node, ...props }) => (
                <ul
                  className="list-disc pl-5 sm:pl-6 space-y-2 text-sm sm:text-base text-muted-foreground"
                  {...props}
                />
              ),
              ol: ({ node, ...props }) => (
                <ol
                  className="list-decimal pl-5 sm:pl-6 space-y-2 text-sm sm:text-base text-muted-foreground"
                  {...props}
                />
              ),
              li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
              blockquote: ({ node, ...props }) => (
                <blockquote
                  className="border-l-2 border-border pl-3 sm:pl-4 italic text-sm sm:text-base text-muted-foreground my-4 sm:my-6"
                  {...props}
                />
              ),
              hr: () => <hr className="border-border my-6 sm:my-8" />,
              code: ({ inline, className, children, ...props }: any) => {
                if (inline) {
                  return (
                    <code
                      className="rounded bg-muted px-1.5 py-0.5 text-[12px] sm:text-[13px] text-foreground"
                      {...props}
                    >
                      {children}
                    </code>
                  )
                }
                return (
                  <code
                    className={`block rounded bg-muted px-3 py-2 text-xs sm:text-sm font-mono overflow-x-auto ${className}`}
                    {...props}
                  >
                    {children}
                  </code>
                )
              },
              img: ({ node, ...props }) => <img className="w-full h-auto rounded-lg my-4 sm:my-6" {...props} />,
            }}
          >
            {markdown}
          </ReactMarkdown>
        ) : null}
      </article>
    </main>
  )
}
