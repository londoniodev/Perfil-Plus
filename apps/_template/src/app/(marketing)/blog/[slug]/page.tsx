import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize";
import { headers } from "next/headers";
import { Metadata } from "next";
import { getTenantFeatures } from "@alvarosky/shared";
import { TenantFeature } from "@alvarosky/types";
import { PostHeader, RelatedTopics, AdaptiveImage, Button, IconLock, IconDocument, IconFile, ShareButtons, TableOfContents, type TocItem } from "@alvarosky/ui";
import { BlogBackButton } from "../BlogBackButton";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

// SITE_URL eliminado staticamente. Se calcula dinamicamente en cada funcion.

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const headersList = await headers()
    const features = getTenantFeatures(headersList);
    
    // Protección de ruta por Feature (Si no tiene BLOG, no generamos meta)
    const blogFeature: TenantFeature = "BLOG";
    if (!features.has(blogFeature)) {
      return { title: "No encontrado" };
    }

    const tenantId = headersList.get("x-tenant-id") || "template"
    const host = headersList.get("x-forwarded-host") || headersList.get("host") || "localhost";
    const isLocal = host.includes("localhost") || host.includes("127.0.0.1") || host.includes(":");
    const protocol = isLocal ? "http" : "https";
    const dynamicSiteUrl = `${protocol}://${host}`;

    const post = await getPostBySlug(slug, tenantId);
    const title = post.metaTitle || post.title;
    const description = post.metaDescription || post.excerpt;

    return {
      title: `${title} | Blog`,
      description,
      authors: [{ name: post.authorName }],
      openGraph: {
        type: 'article',
        title,
        description,
        url: `${dynamicSiteUrl}/blog/${slug}`,
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
        canonical: `${dynamicSiteUrl}/blog/${slug}`,
      },
    };
  } catch {
    return {
      title: "Artículo no encontrado | Blog",
    };
  }
}



// ... keep generateMetadata ...

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;

  let post;
  let dynamicSiteUrl = "http://localhost:3000";
  try {
    const headersList = await headers()
    const features = getTenantFeatures(headersList);

    // 1. Protección de ruta por Feature (DRY + Performance: Antes de DB)
    const blogFeature: TenantFeature = "BLOG";
    if (!features.has(blogFeature)) {
      return notFound();
    }

    const tenantId = headersList.get("x-tenant-id") || "template"
    const host = headersList.get("x-forwarded-host") || headersList.get("host") || "localhost";
    const isLocal = host.includes("localhost") || host.includes("127.0.0.1") || host.includes(":");
    const protocol = isLocal ? "http" : "https";
    dynamicSiteUrl = `${protocol}://${host}`;

    post = await getPostBySlug(slug, tenantId);
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
      "url": dynamicSiteUrl
    },
    "publisher": {
      "@type": "Organization",
      "name": post.authorName,
      "url": dynamicSiteUrl
    },
    "datePublished": post.publishedAt || post.createdAt,
    "dateModified": post.updatedAt || post.createdAt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${dynamicSiteUrl}/blog/${slug}`
    },
    "wordCount": post.content?.split(/\s+/).length || 0,
    "articleSection": post.categories?.[0]?.name || "General",
    "keywords": post.tags?.map((t: { name: string }) => t.name).join(", ") || ""
  };

  const { html, toc } = processContent(post.content || "");
  const postUrl = `${dynamicSiteUrl}/blog/${slug}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="min-h-screen bg-zinc-950 text-white pb-20 relative">
        {/* Ambient glows */}
        <div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-fuchsia-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-40 right-1/4 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 pt-28 md:pt-32 relative z-10">
          <div className="max-w-4xl mx-auto">
            <BlogBackButton />

            <PostHeader
              title={post.title}
              breadcrumbs={[
                { label: "Blog", href: "/blog" },
                { label: post.categories?.[0]?.name || "General", href: `/blog?category=${post.categories?.[0]?.id || ""}` },
                { label: post.title, href: "#" }
              ]}
              author={{
                name: post.authorName,
                image: undefined
              }}
              date={post.createdAt}
              readTime={post.readingTime ? `${post.readingTime} min` : undefined}
              shareUrl={postUrl}
              className="mt-8"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 max-w-6xl mx-auto mt-12">
            <div className="min-w-0">
              {/* Share Top Removed - Integrated in Header */}

              {/* Cover Image */}
              {post.coverImage && (
                <div className="mb-12">
                  <AdaptiveImage
                    src={post.coverImage}
                    alt={post.title}
                    aspectRatio="video"
                    className="w-full h-auto rounded-xl shadow-lg"
                  />
                </div>
              )}

              {post.isContentLimited && (
                <div className="bg-white/5 backdrop-blur-md text-white p-8 rounded-xl border border-white/10 shadow-lg mb-12 relative overflow-hidden">
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
                       prose prose-invert lg:prose-lg max-w-none font-sans
                       prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-white
                       prose-p:text-zinc-300 prose-li:text-zinc-300
                       prose-strong:text-white
                       prose-a:text-fuchsia-400 prose-a:no-underline hover:prose-a:underline
                       prose-img:rounded-xl prose-img:shadow-md
                       ${post.isContentLimited ? "opacity-50 blur-[2px] select-none pointer-events-none h-[400px] overflow-hidden relative after:absolute after:inset-0 after:bg-gradient-to-b after:from-transparent after:to-zinc-950" : ""}
                    `}
                dangerouslySetInnerHTML={{ __html: html }}
              />

              {/* Attachments */}
              {!post.isContentLimited && post.attachments && post.attachments.length > 0 && (
                <div className="mt-16 pt-8 border-t border-white/10">
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

              {/* Share Bottom & Tags */}
              <div className="mt-12 pt-8 border-t border-white/10 space-y-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="font-semibold text-lg">¿Te gustó este artículo? ¡Compártelo!</span>
                  <ShareButtons url={postUrl} title={post.title} />
                </div>
                <RelatedTopics topics={post.tags} />
              </div>
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-32 space-y-8">
                {toc.length > 0 && (
                  <div className="bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10">
                    <TableOfContents items={toc} />
                  </div>
                )}
              </div>
            </aside>
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

function processContent(content: string): { html: string; toc: TocItem[] } {
  if (!content) return { html: "", toc: [] };

  let formatted = content;
  if (!content.includes("<p>") && !content.includes("<div>")) {
    formatted = content
      .split(/\n\n+/)
      .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br/>")}</p>`)
      .join("");
  }

  formatted = sanitizeHtml(formatted);

  const toc: TocItem[] = [];
  const headingRegex = /<h([23])>(.*?)<\/h\1>/g;

  const htmlWithIds = formatted.replace(headingRegex, (match, level, text) => {
    // Simple slugify: lowercase, remove special chars, replace spaces with hyphens
    const id = text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    toc.push({
      title: text,
      url: `#${id}`,
      level: parseInt(level),
    });

    return `<h${level} id="${id}">${text}</h${level}>`;
  });

  return { html: htmlWithIds, toc };
}
