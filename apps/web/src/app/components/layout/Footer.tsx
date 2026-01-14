import Link from "next/link";
import Image from "next/image";
import styles from "@/app/styles/footer.module.css";

export function Footer() {
    return (
        <footer className={styles.siteFooter}>
            <div className="container">
                {/* Full Footer - Hidden on Mobile */}
                <div className={`${styles.footerContainer} hidden-on-mobile`}>
                    {/* Logo y tagline */}
                    <div className={styles.footerBrand}>
                        <Image
                            src="/menu_logo.png"
                            alt="Mauro Mera Logo"
                            width={120}
                            height={32}
                            className={styles.footerLogo}
                        />
                        <span className={styles.footerTagline}>
                            Transformar el mundo empieza por cuidar el mundo interno.
                        </span>
                    </div>

                    {/* Enlaces */}
                    <nav className={styles.footerNav}>
                        <Link href="/" className={styles.footerLink}>Inicio</Link>
                        <Link href="/portafolio" className={styles.footerLink}>Portafolio</Link>
                        <Link href="/servicios" className={styles.footerLink}>Servicios</Link>
                        <Link href="/blog" className={styles.footerLink}>Blog</Link>
                        <Link href="https://wa.me/573183771838" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>Contacto</Link>
                        <Link href="/politica-de-privacidad" className={styles.footerLink}>Privacidad</Link>
                    </nav>
                </div>

                {/* Copyright & Credits - Adapted for Mobile */}
                <div className={styles.footerBottom}>
                    <span className={`${styles.footerCopyright} hidden-on-mobile`}>
                        © {new Date().getFullYear()} Mauro Mera. Todos los derechos reservados.
                    </span>
                    <span className={`${styles.footerCredits} mobile-minimal-signature`}>
                        Desarrollado por{" "}
                        <a href="https://portafolio.alvarolondoño.dev" target="_blank" rel="noopener noreferrer" style={{ fontStyle: "italic" }}>
                            Alvaro Londoño
                        </a>
                    </span>
                </div>
            </div>
        </footer>
    );
}
