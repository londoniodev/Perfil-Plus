import { headers } from "next/headers";
import { getTenantId } from "@/lib/config-server";
import { Fill } from "@alvarosky/ui";
import Link from "next/link";
import { Clock, ArrowRight, BookOpen } from "lucide-react";

const INTERNAL_API_URL = process.env.INTERNAL_API_URL || "http://127.0.0.1:3001/api";

async function getBlogPosts(tenantId: string) {
  try {
    const res = await fetch(`${INTERNAL_API_URL}/blog/posts?limit=12`, {
      headers: {
        'x-internal-token': process.env.INTERNAL_API_KEY || 'default_dev_secret_key',
        'x-tenant-id': tenantId
      },
      next: {
        revalidate: 3600,
        tags: ["tenant-blog", `tenant-blog-${tenantId}`],
      },
    });

    if (!res.ok) return { data: [] };
    return await res.json();
  } catch (error) {
    console.error(`Error fetching blog posts for tenant ${tenantId}:`, error);
    return { data: [] };
  }
}

import { notFound } from "next/navigation";
import { TenantFeature } from "@alvarosky/types";
import { getTenantFeatures } from "@alvarosky/shared";

export default async function BlogPage() {
  const headersList = await headers();
  const tenantId = headersList.get("x-tenant-id") || await getTenantId();
  const tenantSlug = headersList.get("x-tenant-slug") || "";
  const features = getTenantFeatures(headersList);

  if (!tenantId) {
    return (
      <Fill>
        <h1 className="text-2xl font-bold mb-4">Blog no disponible</h1>
      </Fill>
    );
  }

  const blogFeature: TenantFeature = "BLOG";
  if (!features.has(blogFeature)) {
    return notFound();
  }

  const { data: posts } = await getBlogPosts(tenantId);

  return (
    <section className="relative min-h-screen bg-zinc-950 pb-20 pt-28 md:pb-32 md:pt-32">
      {/* Ambient Background Glows */}
      <div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-fuchsia-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-40 right-1/4 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <header className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 text-sm font-medium mb-6">
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            Artículos & Consejos
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-4">
            Blog
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            {tenantSlug === 'mauromera' 
              ? "Explora mis reflexiones sobre liderazgo, cultura organizacional y desarrollo personal." 
              : "Explora nuestros últimos artículos, novedades y reflexiones."}
          </p>
        </header>

        {/* Posts Grid */}
        {!posts || posts.length === 0 ? (
          <div className="text-center py-20 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
            <BookOpen className="w-12 h-12 text-zinc-500 mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-xl font-medium text-white mb-2">Aún no hay entradas</h3>
            <p className="text-zinc-400">Pronto publicaremos nuevos artículos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {posts.map((post: any, index: number) => (
              <article key={post.id}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col h-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden hover:border-fuchsia-500/30 hover:bg-white/[0.08] hover:shadow-xl hover:shadow-fuchsia-500/5 transition-all duration-300"
                >
                  {/* Cover Image */}
                  {post.coverImage ? (
                    <div className="w-full aspect-[16/9] overflow-hidden bg-white/5">
                      <img
                        src={post.coverImage}
                        alt={`Imagen de portada: ${post.title}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    /* Placeholder gradient when no image */
                    <div className="w-full aspect-[16/9] bg-gradient-to-br from-fuchsia-500/10 via-purple-500/5 to-indigo-500/10 flex items-center justify-center">
                      <BookOpen className="w-10 h-10 text-fuchsia-500/30" aria-hidden="true" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex flex-col flex-1 p-5 sm:p-6">
                    {/* Category badge */}
                    {post.category && (
                      <span className="self-start px-2.5 py-0.5 rounded-full bg-fuchsia-500/10 text-fuchsia-400 text-xs font-semibold mb-3">
                        {post.category.name}
                      </span>
                    )}

                    {/* Title */}
                    <h2 className="text-lg sm:text-xl font-bold text-white line-clamp-2 leading-snug group-hover:text-fuchsia-400 transition-colors duration-200 mb-3">
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-sm text-zinc-400 line-clamp-3 flex-1 leading-relaxed mb-4">
                      {post.excerpt || "Haz clic para leer el artículo completo..."}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex items-center gap-3 text-xs text-zinc-500">
                        <time dateTime={post.publishedAt || post.createdAt}>
                          {new Date(post.publishedAt || post.createdAt).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </time>
                        {post.readingTime && (
                          <>
                            <span className="text-white/10">•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" aria-hidden="true" />
                              {post.readingTime} min
                            </span>
                          </>
                        )}
                      </div>
                      <span className="text-fuchsia-400 text-xs font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        Leer
                        <ArrowRight className="w-3 h-3" aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
