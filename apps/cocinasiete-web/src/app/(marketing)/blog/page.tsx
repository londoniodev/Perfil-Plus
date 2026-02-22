import Link from "next/link";
import { Metadata } from "next";
import { getPosts, getCategories } from "@/lib/api";
import { Post, Category } from "@/types/blog";
import { AdaptiveImage } from "@alvarosky/ui";
import { BlogFilter } from "./BlogFilter";

export const metadata: Metadata = {
  title: "Blog | Cocina Siete",
  description:
    "Explora recetas, consejos culinarios y artículos sobre gestión gastronómica.",
};

interface BlogPageProps {
  searchParams: Promise<{ category?: string; page?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { category, page } = await searchParams;
  const currentPage = Number(page) || 1;

  let posts: Post[] = [];
  let totalPages = 1;
  let categories: Category[] = [];

  try {
    const [postsRes, categoriesRes] = await Promise.all([
      getPosts(currentPage, 10, category),
      getCategories(),
    ]);
    posts = postsRes.data;
    totalPages = postsRes.meta?.totalPages || 1;
    categories = categoriesRes;
  } catch (error) {
    console.error("Error fetching blog data:", error);
  }

  const featuredPost = posts[0];
  const recentPosts = posts.slice(1);

  return (
    <main className="min-h-screen bg-zinc-50 pb-20">
      {/* ─── Hero Section ─── */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden">
        {/* Gradient background accent */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/8 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-b from-zinc-900 to-zinc-700 bg-clip-text text-transparent">
              Nuestro Blog
            </h1>
            <p className="text-lg text-zinc-600">
              Explora recetas, consejos y gestión.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4">
        {/* ─── Category Filter ─── */}
        {categories.length > 0 && (
          <BlogFilter categories={categories} activeCategory={category} />
        )}

        {/* ─── Empty State ─── */}
        {posts.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white flex items-center justify-center border border-zinc-200">
              <svg
                className="w-10 h-10 text-zinc-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-zinc-900">
              No hay artículos disponibles
            </h2>
            <p className="text-zinc-600">
              Pronto publicaremos contenido interesante. ¡Vuelve pronto!
            </p>
          </div>
        )}

        {/* ─── Featured Post (primer post) ─── */}
        {featuredPost && (
          <section className="mb-16">
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="group block relative rounded-2xl overflow-hidden border border-zinc-200 bg-white hover:border-primary/40 transition-all duration-300 shadow-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                {/* Image */}
                <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[360px] overflow-hidden">
                  {featuredPost.coverImage ? (
                    <AdaptiveImage
                      src={featuredPost.coverImage}
                      alt={featuredPost.title}
                      aspectRatio="video"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <svg
                        className="w-16 h-16 text-primary/30"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
                        />
                      </svg>
                    </div>
                  )}
                  {/* Gradient overlay en mobile */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent md:hidden" />
                </div>

                {/* Content */}
                <div className="p-6 md:p-10 flex flex-col justify-center">
                  {featuredPost.categories?.[0] && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/15 text-primary w-fit mb-4">
                      {featuredPost.categories[0].name}
                    </span>
                  )}
                  <h2 className="text-2xl md:text-3xl font-bold mb-3 text-zinc-900 group-hover:text-primary transition-colors line-clamp-2">
                    {featuredPost.title}
                  </h2>
                  <p className="text-zinc-600 line-clamp-3 mb-6 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-zinc-500">
                    <span className="font-medium text-zinc-900">
                      {featuredPost.authorName}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-zinc-400" />
                    <time>
                      {new Date(featuredPost.createdAt).toLocaleDateString(
                        "es-ES",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </time>
                    {featuredPost.readingTime && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-zinc-400" />
                        <span>{featuredPost.readingTime} min de lectura</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* ─── Recent Posts Grid ─── */}
        {recentPosts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-zinc-900">Recientes</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group block rounded-xl overflow-hidden border border-zinc-200 bg-white hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 shadow-sm"
                >
                  {/* Card Image */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {post.coverImage ? (
                      <AdaptiveImage
                        src={post.coverImage}
                        alt={post.title}
                        aspectRatio="video"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center">
                        <svg
                          className="w-10 h-10 text-primary/25"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
                          />
                        </svg>
                      </div>
                    )}
                    {post.isPremium && (
                      <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-yellow-500/90 text-black text-xs font-semibold flex items-center gap-1">
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 1l3.22 6.636 7.28 1.056-5.25 5.124 1.238 7.284L12 17.827l-6.488 3.273 1.237-7.284L1.5 8.692l7.28-1.056z" />
                        </svg>
                        Premium
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-5">
                    {post.categories?.[0] && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary mb-3">
                        {post.categories[0].name}
                      </span>
                    )}
                    <h3 className="font-semibold text-lg text-zinc-900 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-zinc-600 line-clamp-2 mb-4 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span className="text-zinc-900">{post.authorName}</span>
                      <span className="w-1 h-1 rounded-full bg-zinc-400" />
                      <time>
                        {new Date(post.createdAt).toLocaleDateString("es-ES", {
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ─── Pagination ─── */}
        {totalPages > 1 && (
          <nav className="flex items-center justify-center gap-2 mt-16">
            {currentPage > 1 && (
              <Link
                href={`/blog?page=${currentPage - 1}${category ? `&category=${category}` : ""}`}
                className="px-4 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-sm font-medium hover:bg-zinc-100 hover:border-zinc-300 transition-colors"
              >
                ← Anterior
              </Link>
            )}

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <Link
                  key={pageNum}
                  href={`/blog?page=${pageNum}${category ? `&category=${category}` : ""}`}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${pageNum === currentPage
                    ? "bg-primary text-white"
                    : "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-100 hover:border-zinc-300"
                    }`}
                >
                  {pageNum}
                </Link>
              )
            )}

            {currentPage < totalPages && (
              <Link
                href={`/blog?page=${currentPage + 1}${category ? `&category=${category}` : ""}`}
                className="px-4 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-sm font-medium hover:bg-zinc-100 hover:border-zinc-300 transition-colors"
              >
                Siguiente →
              </Link>
            )}
          </nav>
        )}
      </div>
    </main>
  );
}
