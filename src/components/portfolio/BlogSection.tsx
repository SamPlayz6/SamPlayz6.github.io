'use client'

import { useEffect, useState } from 'react'

interface BlogPost {
  title: string
  pubDate: string
  categories: string[]
  description: string
  link: string
}

export default function BlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBlogPosts() {
      const rss2jsonEndpoint = 'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fsamsspot.substack.com%2Ffeed'

      try {
        const response = await fetch(rss2jsonEndpoint)
        const data = await response.json()

        if (data.status === 'ok') {
          setPosts(data.items.slice(0, 2))
        } else {
          console.error('Failed to fetch blog posts')
        }
      } catch (error) {
        console.error('Error fetching blog posts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBlogPosts()
  }, [])

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(dateString))
  }

  return (
    <section id="blog" className="bg-portfolio-section-light dark:bg-portfolio-section-dark min-h-[calc(100vh-60px)] flex flex-col justify-center transition-colors duration-300">
      <div className="max-w-[1200px] mx-auto px-4 py-8 flex-grow flex flex-col justify-center">
        <h2 className="text-portfolio-text-light dark:text-portfolio-text-dark pb-2 border-b-2 border-portfolio-nav-light dark:border-gray-700 mb-6">
          Blog Posts
        </h2>
        <div className="space-y-4">
          {loading ? (
            <p className="text-portfolio-text-light dark:text-portfolio-text-dark">Loading blog posts...</p>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <article
                key={post.link}
                className="bg-portfolio-section-light dark:bg-portfolio-section-dark p-4 rounded-md shadow-md transition-colors duration-300"
              >
                <h3 className="text-lg font-bold mb-1 text-portfolio-text-light dark:text-portfolio-text-dark">
                  {post.title}
                </h3>
                <p className="italic text-portfolio-text-light dark:text-gray-400 text-sm mb-2">
                  Posted on {formatDate(post.pubDate)} | Category: {post.categories.join(', ')}
                </p>
                <p className="text-portfolio-text-light dark:text-portfolio-text-dark mb-2">
                  {post.description.slice(0, 150)}...
                </p>
                <a
                  href={post.link}
                  className="text-portfolio-link-light dark:text-portfolio-link-dark hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read More
                </a>
              </article>
            ))
          ) : (
            <p className="text-portfolio-text-light dark:text-portfolio-text-dark">No blog posts found.</p>
          )}
        </div>
      </div>
    </section>
  )
}
