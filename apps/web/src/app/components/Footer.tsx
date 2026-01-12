import Link from "next/link";
import Image from "next/image";

export function Footer() {
    return (
        <footer className="site-footer">
            <div className="container">
                <div className="footer-container">
                    {/* Logo y tagline */}
                    <div className="footer-brand">
                        <Image
                            src="/menu_logo.png"
                            alt="Mauro Mera Logo"
                            width={120}
                            height={32}
                            className="footer-logo"
                        />
                        <span className="footer-tagline">
                            Transformar el mundo empieza por cuidar el mundo interno.
                        </span>
                    </div>

                    {/* Enlaces */}
                    <nav className="footer-nav">
                        <Link href="/" className="footer-link">Inicio</Link>
                        <Link href="/portafolio" className="footer-link">Portafolio</Link>
                        <Link href="/servicios" className="footer-link">Servicios</Link>
                        <Link href="/blog" className="footer-link">Blog</Link>
                        <Link href="https://wa.me/573183771838" target="_blank" rel="noopener noreferrer" className="footer-link">Contacto</Link>
                        <Link href="/politica-de-privacidad" className="footer-link">Privacidad</Link>
                    </nav>
                </div>

                {/* Copyright */}
                <div className="footer-bottom">
                    <span className="footer-copyright">
                        © {new Date().getFullYear()} Mauro Mera. Todos los derechos reservados.
                    </span>
                    <span className="footer-credits">
                        Desarrollado por{" "}
                        <a href="https://portafolio.alvarolondoño.dev" target="_blank" rel="noopener noreferrer">
                            Alvaro Londoño
                        </a>
                    </span>
                </div>
            </div>
        </footer>
    );
}
