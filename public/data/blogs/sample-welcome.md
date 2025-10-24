Sample markdown post. Replace with your real Medium exports or new writeups. 
# Welcome

This blog now renders Markdown files from `/public/data/blogs`. To publish a new entry:

1. Create a new markdown file in `/public/data/blogs`, for example: `/public/data/blogs/my-first-post.md`.
2. Add an entry to `/public/data/blogs/index.json` with:
   - `slug`: unique identifier (e.g., `"my-first-post"`)
   - `title`, `date` (ISO or human-readable), optional `readTime`, and the `file` path (e.g., `"/data/blogs/my-first-post.md"`).
3. Save. The post will appear in the list automatically.

You can paste content exported from Medium into markdown files. Basic formatting, code blocks, and tables are supported via GFM.
