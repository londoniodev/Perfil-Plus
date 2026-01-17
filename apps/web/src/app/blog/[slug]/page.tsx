import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize";
import { Metadata } from "next";
import { Button } from "@mauromera/ui";
import { BlogBreadcrumbs } from "../BlogBreadcrumbs";
import { BlogMeta } from "../BlogMeta";
import { BlogBackButton } from "../BlogBackButton";
import { IconDocument, IconFile, IconImage, IconLock } from "@mauromera/ui";

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="min-h-screen pb-20 bg-background">
        <div className="container mx-auto px-4 pt-8">
          <BlogBackButton />
        </div>

        {/* Hero */}
        <header className="container mx-auto px-4 mb-4">
          <div className="max-w-4xl mx-auto">
            <BlogBreadcrumbs />

            <BlogMeta
              date={post.createdAt}
              readingTime={post.readingTime || undefined}
              category={post.categories[0]}
            />

            <h1 className="text-3xl md:text-5xl font-bold mt-6 mb-6 font-serif leading-tight">
              {post.title}
            </h1>

            <p className="text-xl text-foreground-muted leading-relaxed mb-8 border-l-4 border-primary/30 pl-6 italic">
              {post.excerpt}
            </p>

            <div className="flex items-center gap-3 text-sm mb-12 border-t border-border pt-6">
              <span className="text-foreground-muted">Por</span>
              <Link href="/about-me" className="font-semibold text-primary hover:underline">
                {post.authorName}
              </Link>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="w-full h-[300px] md:h-[500px] relative mb-16 bg-muted">
            <div className="container mx-auto h-full px-4">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover rounded-xl shadow-lg"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {post.isContentLimited && (
              <div className="bg-card text-card-foreground p-8 rounded-xl border border-border shadow-lg mb-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <IconLock className="w-24 h-24" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <IconLock className="w-5 h-5 text-primary" />
                    Contenido Premium
                  </h3>
                  <p className="text-foreground-muted mb-6"> Este artículo es exclusivo para suscriptores. Suscríbete para acceder al contenido completo y desbloquear todo el potencial.</p>
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link href="/suscripcion">Suscribirme ahora</Link>
                  </Button>
                </div>
              </div>
            )}

            <div
              className={`
                 prose prose-lg dark:prose-invert max-w-none 
                 prose-headings:font-serif prose-headings:font-bold
                 prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                 prose-img:rounded-xl prose-img:shadow-md
                 ${post.isContentLimited ? "opacity-50 blur-[2px] select-none pointer-events-none h-[400px] overflow-hidden relative after:absolute after:inset-0 after:bg-gradient-to-b after:from-transparent after:to-background" : ""}
              `}
              dangerouslySetInnerHTML={{ __html: formatContent(post.content || "") }}
            />

            {/* Attachments */}
            {!post.isContentLimited && post.attachments && post.attachments.length > 0 && (
              <div className="mt-16 pt-8 border-t border-border">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  📎 Archivos Adjuntos
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {post.attachments.map((attachment: any) => (
                    <li key={attachment.id}>
                      <a
                        href={attachment.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-accent hover:border-accent-glow transition-all group"
                      >
                        <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                          {attachment.fileType.includes('pdf') ? <IconDocument /> : <IconFile />}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="block font-medium truncate">{attachment.name}</span>
                          <span className="text-xs text-foreground-muted">({formatFileSize(attachment.fileSize)})</span>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-12 flex flex-wrap gap-2">
                {post.tags.map((tag: { id: string; name: string }) => (
                  <span key={tag.id} className="px-3 py-1 bg-muted text-foreground-muted rounded-full text-sm font-medium hover:text-primary hover:bg-primary/5 transition-colors cursor-default">
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

// Format file size helper (Duplicate due to server component isolation if needed, or import)
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatContent(content: string): string {
  if (!content) return "";
  let formatted = content;
  if (!content.includes("<p>") && !content.includes("<div>")) {
    formatted = content
      .split(/\n\n+/)
      .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br/>")}</p>`)
      .join("");
  }
  return sanitizeHtml(formatted);
}
