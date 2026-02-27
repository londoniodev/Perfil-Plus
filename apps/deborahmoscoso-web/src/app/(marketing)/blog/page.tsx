import { Fill } from "@alvarosky/ui";
import { motion } from "framer-motion";
import { getBlogPosts } from "@/lib/data";
import { BlogPageClient } from "./BlogPageClient";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getBlogPosts();

  // Extract unique categories for the filters
  const categoriesSet = new Set<string>();
  posts.forEach(post => {
    post.categories?.forEach((catRef: any) => {
      if (catRef.category?.name) {
        categoriesSet.add(catRef.category.name);
      }
    });
  });

  const categories = Array.from(categoriesSet);

  return (
    <Fill>
      {/* Cinematic Blog Hero */}
      <section className="relative h-[60vh] flex items-center overflow-hidden bg-zinc-950">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1434493907317-a46b53b81822?q=80&w=2070&auto=format&fit=crop"
            alt="Blog Background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/60 to-zinc-950" />
        </div>

        <div className="container relative z-10 px-4 text-center">
          <span className="text-fuchsia-500 font-bold uppercase tracking-[0.4em] text-xs mb-6 block italic">
            THE PERFORMANCE JOURNAL
          </span>
          <h1 className="text-7xl md:text-9xl font-black text-white mb-8 tracking-tighter leading-none">
            EL <span className="text-fuchsia-500 italic">LOGBOOK</span>
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed opacity-80">
            Artículos exclusivos sobre biohacking, nutrición avanzada y la mentalidad necesaria para alcanzar la excelencia física.
          </p>
        </div>
      </section>

      <BlogPageClient posts={posts} categories={categories} />
    </Fill>
  );
}
