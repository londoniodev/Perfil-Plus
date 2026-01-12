import Link from "next/link";
import { getPosts, getCategories } from "@/lib/api";
import { Post, Category } from "@/lib/types";
import { Metadata } from "next";
import styles from "./blog.module.css";
import { BreadcrumbSchema, CollectionPageSchema } from "../components/seo/JsonLd";

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

      <div className={styles.blogPage}>
        <section className={styles.blogHero}>
          <div className="container">
            <h1>Blog</h1>
            <p>
              Reflexiones, herramientas y estrategias para transformar
              tu vida personal y profesional.
            </p>
          </div>
        </section>

        <section className={styles.blogContent}>
          <div className="container">
            {/* Filtros de categoría */}
            <div className={styles.blogFilters}>
              <Link
                href="/blog"
                className={`${styles.filterBtn} ${!category ? styles.active : ""}`}
              >
                Todos
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/blog?category=${cat.slug}`}
                  className={`${styles.filterBtn} ${category === cat.slug ? styles.active : ""}`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            {error ? (
              <div className={styles.blogError}>
                <p>No se pudieron cargar los artículos. Inténtalo más tarde.</p>
              </div>
            ) : posts.length === 0 ? (
              <div className={styles.blogEmpty}>
                <p>No hay artículos disponibles en este momento.</p>
              </div>
            ) : (
              <>
                {/* Grid de posts */}
                <div className={styles.blogGrid}>
                  {posts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className={styles.blogPagination}>
                    {page > 1 && (
                      <Link
                        href={`/blog?page=${page - 1}${category ? `&category=${category}` : ""}`}
                        className={styles.paginationBtn}
                      >
                        ← Anterior
                      </Link>
                    )}
                    <span className={styles.paginationInfo}>
                      Página {page} de {totalPages}
                    </span>
                    {page < totalPages && (
                      <Link
                        href={`/blog?page=${page + 1}${category ? `&category=${category}` : ""}`}
                        className={styles.paginationBtn}
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
  return (
    <Link href={`/blog/${post.slug}`} className={styles.blogCard}>
      <article>
        <div className={styles.cardImage}>
          {post.coverImage ? (
            <img src={post.coverImage} alt={post.title} />
          ) : (
            <div className={styles.placeholderImage}>
              <span>📝</span>
            </div>
          )}
          {post.isPremium && <span className={styles.premiumBadge}>Premium</span>}
        </div>
        <div className={styles.cardContent}>
          <div className={styles.cardMeta}>
            {post.categories.length > 0 && (
              <span className={styles.category}>{post.categories[0].name}</span>
            )}
            <time dateTime={post.createdAt}>
              {new Date(post.createdAt).toLocaleDateString("es-CO", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </time>
          </div>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
          <div className={styles.cardFooter}>
            <span className={styles.readMore}>Leer más →</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
