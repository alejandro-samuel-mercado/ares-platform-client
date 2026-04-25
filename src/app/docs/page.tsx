import fs from 'fs/promises';
import path from 'path';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import './docs.css';

export default async function DocsPage() {
    let markdownContent = '';
    
    try {
        const filePath = path.join(process.cwd(), 'src/app/docs/guia.md');
        markdownContent = await fs.readFile(filePath, 'utf8');
    } catch (e) {
        markdownContent = '# ❌ Error 404\nNo se pudo cargar la documentación.';
    }

    return (
        <div className="docs-layout">
            <header className="docs-navbar">
                <div className="docs-container">
                    <div className="docs-nav-inner">
                        <Link href="/landing" className="docs-logo">
                            ARES <span className="logo-accent">DOCS</span>
                        </Link>
                        <Link href="/landing" className="docs-back-btn">
                            Volver a Ares
                        </Link>
                    </div>
                </div>
            </header>

            <main className="docs-main">
                <div className="docs-container docs-grid">
                    {/* Contenedor del documento principal */}
                    <article className="docs-content markdown-pro">
                        <ReactMarkdown 
                            remarkPlugins={[remarkGfm]} 
                            rehypePlugins={[rehypeRaw]}
                        >
                            {markdownContent}
                        </ReactMarkdown>
                    </article>
                    
                    {/* Barra lateral de ayuda rápida */}
                    <aside className="docs-sidebar">
                        <div className="sidebar-card">
                            <h3>👋 Bienvenido</h3>
                            <p>Esta es la enciclopedia oficial de la plataforma. Si tienes dudas de un módulo, usa esta guía para entender el funcionamiento paso a paso.</p>
                            <Link href="/login" className="sidebar-btn">Ir al Sistema</Link>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
