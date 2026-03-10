import { headers } from "next/headers";
import { getTenantId } from "@/lib/config-server";
import { Fill } from "@alvarosky/ui";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@alvarosky/ui";
import Link from "next/link";

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

export default async function BlogPage() {
  const headersList = await headers();
  const tenantId = headersList.get("x-tenant-id") || await getTenantId();

  if (!tenantId) {
    return (
      <Fill>
        <h1 className="text-2xl font-bold mb-4">Blog no disponible</h1>
      </Fill>
    );
  }

  const { data: posts } = await getBlogPosts(tenantId);

  return (
    <section className="relative pb-20 pt-16 md:pb-32 md:pt-24 min-h-[80vh]">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-fuchsia-500">Blog</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Últimos artículos, consejos y reflexiones sobre entrenamiento, nutrición y mentalidad.
          </p>
        </div>

        {!posts || posts.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-border">
            <h3 className="text-xl font-medium mb-2">Aún no hay entradas</h3>
            <p className="text-muted-foreground">Pronto publicaremos nuevos artículos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post: any) => (
              <Link href={`/blog/${post.slug}`} key={post.id}>
                <Card className="h-full bg-background/50 hover:bg-muted/30 transition-all border-border/50 hover:border-primary/50 overflow-hidden group cursor-pointer">
                  {post.coverImage && (
                    <div className="w-full h-48 overflow-hidden">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <CardHeader className={!post.coverImage ? "pt-8" : ""}>
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {post.category && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                          {post.category.name}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                      {post.excerpt || "Haz clic para leer el artículo completo..."}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
