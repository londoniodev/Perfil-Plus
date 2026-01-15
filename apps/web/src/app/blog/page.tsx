import Link from "next/link";
import Image from "next/image";
import { getPosts, getCategories } from "@/lib/api";
import { Post, Category } from "@/lib/types";
import { Metadata } from "next";
import { BreadcrumbSchema, CollectionPageSchema } from "@/components/seo/JsonLd";

import { BlogFilter } from "./BlogFilter";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mauromera.com";

export const metadata: Metadata = {
  title: "Blog | Artículos de Psicología y Liderazgo",
  description: "Artículos sobre psicología, liderazgo, cultura organizacional y desarrollo personal. Reflexiones, herramientas y estrategias para transformar tu vida.",
  keywords: ["blog psicología", "artículos liderazgo", "desarrollo personal", "cultura organizacional"],
  openGraph: {
    title: "Blog | Artículos de Psicología y Liderazgo",
    description: "Reflexiones, herramientas y estrategias para transformar tu vida personal y profesional.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Mauro Mera",
    description: "Artículos sobre psicología, liderazgo y desarrollo personal.",
  },
  alternates: {
    canonical: "/blog",
  },
};

interface BlogPageProps {
  searchParams: Promise<{ page?: string; category?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const category = params.category;

  let posts: Post[] = [];
  let categories: Category[] = [];
  let totalPages = 1;
  let error = false;

  try {
    const [postsData, categoriesData] = await Promise.all([
      getPosts(page, 9, category),
      getCategories(),
    ]);
    posts = postsData.data;
    totalPages = postsData.meta.totalPages;
    categories = categoriesData;
  } catch (e) {
    error = true;
    console.error("Error fetching blog data:", e);
  }

  return (
    <>
      {/* Structured Data para SEO */}
      <BreadcrumbSchema items={[
        { name: "Inicio", url: SITE_URL },
        { name: "Blog", url: `${SITE_URL}/blog` },
      ]} />
      <CollectionPageSchema
        name="Blog - Mauro Mera"
        description="Artículos sobre psicología, liderazgo, cultura organizacional y desarrollo personal."
        url={`${SITE_URL}/blog`}
        itemListElement={posts.slice(0, 10).map(post => ({
          name: post.title,
          url: `${SITE_URL}/blog/${post.slug}`,
        }))}
      />

      <div className="blog-page">
        <section className="blog-hero">
          <div className="container">
            <h1 className="page-hero-title">Blog</h1>
            <p className="hero-description">
              Reflexiones, herramientas y estrategias para transformar
              tu vida personal y profesional.
            </p>
          </div>
        </section>

        <section className="blog-content">
          <div className="container">
            {/* Filtros de categoría */}
            <BlogFilter categories={categories} activeCategory={category} />

            {error ? (
              <div className="blog-error">
                <p>No se pudieron cargar los artículos. Inténtalo más tarde.</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="blog-empty">
                <p>No hay artículos disponibles en este momento.</p>
              </div>
            ) : (
              <>
                {/* Grid de posts */}
                <div className="blog-grid">
                  {posts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="blog-pagination">
                    {page > 1 && (
                      <Link
                        href={`/blog?page=${page - 1}${category ? `&category=${category}` : ""}`}
                        className="pagination-btn"
                      >
                        ← Anterior
                      </Link>
                    )}
                    <span className="pagination-info">
                      Página {page} de {totalPages}
                    </span>
                    {page < totalPages && (
                      <Link
                        href={`/blog?page=${page + 1}${category ? `&category=${category}` : ""}`}
                        className="pagination-btn"
                      >
                        Siguiente →
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

function BlogCard({ post }: { post: Post }) {
  // Función helper para formatear fechas
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('es-CO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Link href={`/blog/${post.slug}`} className="blog-card" prefetch={false}>
      <article style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className="card-image-container">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="card-img"
              style={{ objectFit: "cover" }}
              unoptimized
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              background: 'var(--background-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem'
            }}>
              <span>📝</span>
            </div>
          )}
          {post.isPremium && <span className="premium-badge">PREMIUM</span>}
        </div>

        <div className="card-content">
          <div className="card-meta">
            {post.categories.length > 0 && (
              <span className="card-category">{post.categories[0].name}</span>
            )}
            <time dateTime={post.createdAt}>
              {formatDate(post.createdAt)}
            </time>
          </div>

          <h2 className="card-title">{post.title}</h2>

          <p className="card-excerpt">
            {post.excerpt || (post.content ? post.content.substring(0, 100) + '...' : '')}
          </p>

          <div className="card-footer">
            <span className="read-more-text">Leer artículo</span>
            <svg
              className="read-more-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </div>
      </article>
    </Link>
  );
}
