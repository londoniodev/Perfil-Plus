import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/api";
import { Metadata } from "next";
import styles from "./post.module.css";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getPostBySlug(slug);
    return {
      title: `${post.title} | Blog - Mauro Mera`,
      description: post.excerpt,
      openGraph: {
        title: post.title,
        description: post.excerpt,
        images: post.coverImage ? [post.coverImage] : [],
      },
    };
  } catch {
    return {
      title: "Artículo no encontrado | Blog - Mauro Mera",
    };
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;

  let post;
  try {
    post = await getPostBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <article className={styles.postPage}>
      {/* Hero */}
      <header className={styles.postHero}>
        <div className="container">
          <div className={styles.postMeta}>
            {post.categories.length > 0 && (
              <Link href={`/blog?category=${post.categories[0].slug}`} className={styles.category}>
                {post.categories[0].name}
              </Link>
            )}
            <time dateTime={post.createdAt}>
              {new Date(post.createdAt).toLocaleDateString("es-CO", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
          </div>
          <h1>{post.title}</h1>
          <p className={styles.excerpt}>{post.excerpt}</p>
          <div className={styles.author}>
            <span className={styles.authorName}>{post.authorName}</span>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      {post.coverImage && (
        <div className={styles.postCover}>
          <div className="container">
            <img src={post.coverImage} alt={post.title} />
          </div>
        </div>
      )}

      {/* Content */}
      <div className={styles.postContent}>
        <div className={`container ${styles.contentContainer}`}>
          {post.isContentLimited && (
            <div className={styles.premiumBanner}>
              <div className={styles.premiumIcon}>🔒</div>
              <h3>Contenido Premium</h3>
              <p>Este artículo es exclusivo para suscriptores. Suscríbete para acceder al contenido completo.</p>
              <Link href="/suscripcion" className="btn btn-primary">
                Suscribirme ahora
              </Link>
            </div>
          )}

          <div
            className={`${styles.content} ${post.isContentLimited ? styles.limited : ""}`}
            dangerouslySetInnerHTML={{ __html: formatContent(post.content || "") }}
          />

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className={styles.postTags}>
              {post.tags.map((tag) => (
                <span key={tag.id} className={styles.tag}>
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className={styles.postNav}>
        <div className="container">
          <Link href="/blog" className={styles.backLink}>
            ← Volver al blog
          </Link>
        </div>
      </div>
    </article>
  );
}

// Formato básico del contenido (convertir saltos de línea en párrafos)
function formatContent(content: string): string {
  if (!content) return "";

  // Si ya tiene HTML, retornar tal cual
  if (content.includes("<p>") || content.includes("<div>")) {
    return content;
  }

  // Convertir saltos de línea dobles en párrafos
  return content
    .split(/\n\n+/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br/>")}</p>`)
    .join("");
}
