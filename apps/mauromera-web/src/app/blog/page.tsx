import Link from "next/link";
import Image from "next/image";
import { getPosts, getCategories } from "@/lib/api";
import { Post, Category } from "@/types/blog";
import { Metadata } from "next";
import { BreadcrumbSchema, CollectionPageSchema } from "@/components/seo/JsonLd";
import { BlogFilter } from "./BlogFilter";
import { Card, CardContent, CardFooter } from "@alvarosky/ui";
import { Badge } from "@alvarosky/ui";
import { IconArrowRight } from "@alvarosky/ui";
import { PageHeader, AdaptiveImage } from "@alvarosky/ui";

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
  // ... (setup logic remains the same)
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

      <div className="min-h-screen bg-background pb-12">
        <PageHeader
          className="container px-4 mx-auto pt-32 md:pt-32 mb-12"
          title="Blog"
          description="Reflexiones, herramientas y estrategias para transformar tu vida personal y profesional."
        />

        <section>
          <div className="container px-4 mx-auto">
            <BlogFilter categories={categories} activeCategory={category} />

            {error ? (
              <div className="py-12 text-center text-error bg-error/5 rounded-xl border border-error/20">
                <p>No se pudieron cargar los artículos. Inténtalo más tarde.</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="py-24 text-center border-2 border-dashed border-border rounded-xl">
                <div className="text-6xl mb-4 opacity-50">📝</div>
                <p className="text-xl text-foreground-muted font-medium">No hay artículos disponibles en este momento.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {posts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-16 flex items-center justify-center gap-4">
                    {page > 1 && (
                      <Link
                        href={`/blog?page=${page - 1}${category ? `&category=${category}` : ""}`}
                        className="px-6 py-3 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-sm font-medium"
                      >
                        ← Anterior
                      </Link>
                    )}
                    <span className="text-sm font-medium text-foreground-muted bg-muted py-3 px-6 rounded-lg">
                      Página {page} de {totalPages}
                    </span>
                    {page < totalPages && (
                      <Link
                        href={`/blog?page=${page + 1}${category ? `&category=${category}` : ""}`}
                        className="px-6 py-3 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-sm font-medium"
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
    <Link href={`/blog/${post.slug}`} className="group h-full block" prefetch={false}>
      <Card className="h-full flex flex-col overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card">
        <div className="relative">
          {post.coverImage ? (
            <AdaptiveImage
              src={post.coverImage}
              alt={post.title}
              aspectRatio="video"
              className="transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="aspect-video w-full flex items-center justify-center bg-accent/20 text-accent text-5xl">
              <span>📝</span>
            </div>
          )}
          {post.isPremium && (
            <div className="absolute top-4 right-4 z-10">
              <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 text-white shadow-lg">PREMIUM</Badge>
            </div>
          )}
        </div>

        <CardContent className="flex-1 p-6 flex flex-col">
          <div className="flex items-center gap-3 text-xs text-foreground-muted mb-4 font-medium uppercase tracking-wider">
            {post.categories.length > 0 && (
              <span className="text-primary">{post.categories[0].name}</span>
            )}
            <span className="w-1 h-1 rounded-full bg-border" />
            <time dateTime={post.createdAt}>
              {formatDate(post.createdAt)}
            </time>
          </div>

          <h2 className="heading-h3 mb-3 leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h2>

          <p className="text-foreground-muted text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
            {post.excerpt || (post.content ? post.content.substring(0, 100).replace(/<[^>]*>?/gm, '') + '...' : '')}
          </p>
        </CardContent>
        <CardFooter className="px-6 pb-6 pt-0 mt-auto">
          <span className="text-sm font-semibold text-primary flex items-center gap-2 group-hover:gap-3 transition-all">
            Leer artículo <IconArrowRight className="w-4 h-4" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}

