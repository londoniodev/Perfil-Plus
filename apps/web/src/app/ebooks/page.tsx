import Link from "next/link";
import { Metadata } from "next";
import styles from "./ebooks.module.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const metadata: Metadata = {
    title: "E-books | Mauro Mera",
    description: "Descubre nuestra colección de e-books sobre psicología, liderazgo y desarrollo personal.",
};

interface Ebook {
    id: string;
    title: string;
    slug: string;
    description: string;
    coverImage: string;
    price: number;
}

async function getEbooks(): Promise<Ebook[]> {
    try {
        const res = await fetch(`${API_BASE}/ebooks`, {
            next: { revalidate: 60 },
        });
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}

export default async function EbooksPage() {
    const ebooks = await getEbooks();

    return (
        <div className={styles.ebooksPage}>
            <section className={styles.ebooksHero}>
                <div className="container">
                    <h1>E-books</h1>
                    <p>
                        Recursos prácticos y herramientas para tu crecimiento personal
                        y profesional. Descárgalos y llévalos contigo.
                    </p>
                </div>
            </section>

            <section className={styles.ebooksContent}>
                <div className="container">
                    {ebooks.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>Próximamente nuevos e-books disponibles.</p>
                        </div>
                    ) : (
                        <div className={styles.ebooksGrid}>
                            {ebooks.map((ebook) => (
                                <Link href={`/ebooks/${ebook.slug}`} key={ebook.id} className={styles.ebookCard}>
                                    <div className={styles.cardImage}>
                                        <img src={ebook.coverImage} alt={ebook.title} />
                                    </div>
                                    <div className={styles.cardContent}>
                                        <h2>{ebook.title}</h2>
                                        <p>{ebook.description}</p>
                                        <span className={styles.price}>
                                            ${Number(ebook.price).toLocaleString("es-CO")}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
