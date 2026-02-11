"use client";

import { motion } from "framer-motion";
import { Search, ChevronRight } from "lucide-react";
import Link from "next/link";

interface BlogPageClientProps {
    posts: any[];
    categories: string[];
}

export function BlogPageClient({ posts, categories }: BlogPageClientProps) {
    return (
        <div className="bg-zinc-950 min-h-screen">
            <div className="container px-4 py-32">
                {/* Search & Categories Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col md:flex-row justify-between items-center gap-10 mb-20"
                >
                    <div className="flex flex-wrap gap-4 justify-center">
                        <button className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-fuchsia-600 text-white transition-all border border-fuchsia-500">
                            ALL POSTS
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-zinc-900 text-zinc-500 hover:bg-fuchsia-600 hover:text-white transition-all border border-zinc-800"
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                        <input
                            type="text"
                            placeholder="SEARCH THE JOURNAL..."
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-6 text-xs font-bold text-white uppercase tracking-widest focus:outline-none focus:border-fuchsia-500 transition-colors"
                        />
                    </div>
                </motion.div>

                {/* Improved Article Grid */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"
                >
                    {posts.map((post) => (
                        <motion.div
                            key={post.id}
                            variants={{
                                hidden: { opacity: 0, y: 30 },
                                visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
                            }}
                            className="group cursor-pointer"
                        >
                            <div className="aspect-[4/3] rounded-[2rem] bg-zinc-900 mb-8 overflow-hidden border border-zinc-800 relative group-hover:border-fuchsia-500/30 transition-all duration-500 shadow-xl shadow-transparent hover:shadow-fuchsia-900/5">
                                <img
                                    src={post.coverImage || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop"}
                                    alt={post.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
                            </div>

                            <div className="pl-2">
                                <span className="text-fuchsia-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 block italic">
                                    {post.categories?.[0]?.category?.name || "ARTICLE"}
                                </span>
                                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-fuchsia-400 transition-colors leading-tight">
                                    {post.title}
                                </h3>
                                <p className="text-zinc-500 text-sm mb-8 line-clamp-2 leading-relaxed opacity-80">
                                    {post.excerpt}
                                </p>
                                <Link href={`/blog/${post.slug}`} className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-3 group-hover:gap-5 transition-all">
                                    Read Article <ChevronRight className="w-4 h-4 text-fuchsia-500" />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
