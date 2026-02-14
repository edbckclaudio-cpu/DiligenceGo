import type { MetadataRoute } from "next"
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "http://localhost:3000"
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/dashboard`, changeFrequency: "weekly", priority: 0.9 }
  ]
}
