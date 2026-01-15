import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize";
import { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import styles from "@/styles/post.module.css";
import { BlogBreadcrumbs } from "../BlogBreadcrumbs";
import { BlogMeta } from "../BlogMeta";
import { BlogBackButton } from "../BlogBackButton";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mauromera.com";

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getPostBySlug(slug);
    const title = post.metaTitle || post.title;
    const description = post.metaDescription || post.excerpt;

    return {
      title: `${title} | Blog - Mauro Mera`,
      description,
      authors: [{ name: post.authorName }],
      openGraph: {
        type: 'article',
        title,
        description,
        url: `${SITE_URL}/blog/${slug}`,
        images: post.coverImage ? [{
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        }] : [],
        publishedTime: post.publishedAt || post.createdAt,
        modifiedTime: post.updatedAt,
        authors: [post.authorName],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: post.coverImage ? [post.coverImage] : [],
      },
      alternates: {
        canonical: `${SITE_URL}/blog/${slug}`,
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

  // JSON-LD Structured Data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.metaDescription || post.excerpt,
    "image": post.coverImage || undefined,
    "author": {
      "@type": "Person",
      "name": post.authorName,
      "url": SITE_URL
    },
    "publisher": {
      "@type": "Organization",
      "name": "Mauro Mera",
      "url": SITE_URL
    },
    "datePublished": post.publishedAt || post.createdAt,
    "dateModified": post.updatedAt || post.createdAt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${slug}`
    },
    "wordCount": post.content?.split(/\s+/).length || 0,
    "articleSection": post.categories?.[0]?.name || "General",
    "keywords": post.tags?.map((t: { name: string }) => t.name).join(", ") || ""
  };

  return (
    <>
      {/* JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className={styles.postPage}>
        <BlogBackButton />

        {/* Hero */}
        <header className={styles.postHero}>
          <div className="container">
            {/* Breadcrumb */}
            <BlogBreadcrumbs />

            {/* Collapsible Meta Info */}
            <BlogMeta
              date={post.createdAt}
              readingTime={post.readingTime || undefined}
              category={post.categories[0]}
            />

            <h1>{post.title}</h1>
            <p className={styles.excerpt}>{post.excerpt}</p>

            <div className={styles.author}>
              <Link href="/about-me" className={styles.authorLink}>
                <span className={styles.authorLabel}>Por</span>
                <span className={styles.authorName}>{post.authorName}</span>
              </Link>
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
                <Button asChild>
                  <Link href="/suscripcion">Suscribirme ahora</Link>
                </Button>
              </div>
            )}

            <div
              className={`${styles.content} ${post.isContentLimited ? styles.limited : ""}`}
              dangerouslySetInnerHTML={{ __html: formatContent(post.content || "") }}
            />

            {/* Attachments - Only show if not content limited and has attachments */}
            {!post.isContentLimited && post.attachments && post.attachments.length > 0 && (
              <div className={styles.attachments}>
                <h3>📎 Archivos Adjuntos</h3>
                <ul>
                  {post.attachments.map((attachment: any) => (
                    <li key={attachment.id}>
                      <a
                        href={attachment.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      >
                        <span className={styles.attachmentIcon}>
                          {attachment.fileType.includes('pdf') ? '📄' : '📎'}
                        </span>
                        <span className={styles.attachmentName}>{attachment.name}</span>
                        <span className={styles.attachmentSize}>
                          ({formatFileSize(attachment.fileSize)})
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className={styles.postTags}>
                {post.tags.map((tag: { id: string; name: string }) => (
                  <span key={tag.id} className={styles.tag}>
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>


      </article>
    </>
  );
}

// Format file size helper
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Formato básico del contenido (convertir saltos de línea en párrafos) con sanitización XSS
function formatContent(content: string): string {
  if (!content) return "";

  let formatted = content;

  // Si NO tiene HTML, convertir saltos de línea dobles en párrafos
  if (!content.includes("<p>") && !content.includes("<div>")) {
    formatted = content
      .split(/\n\n+/)
      .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br/>")}</p>`)
      .join("");
  }

  // Sanitizar para prevenir XSS
  return sanitizeHtml(formatted);
}
