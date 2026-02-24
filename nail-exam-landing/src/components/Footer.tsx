import { useTranslations } from 'next-intl';
import Image from "next/image";

export default function Footer() {
    const t = useTranslations('Footer');

    return (
        <footer className="bg-white pt-16 pb-8 border-t border-border-light">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">

                    <div className="flex items-center gap-3">
                        <Image src="/icon.png" alt="NailPrep Logo" width={40} height={40} className="rounded-lg shadow-sm" />
                        <span className="font-bold text-2xl text-ink tracking-tight">NailPrep</span>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-ink hover:bg-rose-light hover:text-rose cursor-pointer transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.56c-.88.39-1.83.65-2.83.77 1.02-.61 1.8-1.57 2.17-2.73-.95.56-2.01.97-3.13 1.19-.9-.96-2.18-1.56-3.59-1.56-2.72 0-4.92 2.2-4.92 4.92 0 .39.04.76.13 1.12C7.69 8.09 4.07 6.13 1.64 3.16c-.42.72-.66 1.56-.66 2.47 0 1.71.87 3.21 2.19 4.1-.8-.03-1.55-.25-2.22-.61v.06c0 2.37 1.69 4.35 3.93 4.8-.41.11-.85.17-1.3.17-.32 0-.63-.03-.93-.09.62 1.95 2.44 3.37 4.58 3.41-1.68 1.32-3.8 2.1-6.11 2.1-.4 0-.79-.02-1.18-.07 2.17 1.39 4.75 2.22 7.51 2.22 9.01 0 13.94-7.46 13.94-13.94 0-.21 0-.42-.01-.63.94-.68 1.76-1.53 2.41-2.48z" /></svg>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-ink hover:bg-rose-light hover:text-rose cursor-pointer transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85s.01-3.58.07-4.85C2.38 3.86 3.9 2.31 7.15 2.16c1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07c-4.27.2-6.78 2.71-6.98 6.98C0 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.27 2.71 6.78 6.98 6.98 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c4.27-.2 6.78-2.71 6.98-6.98C24 15.67 24 15.26 24 12s-.01-3.67-.07-4.95c-.2-4.27-2.71-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1018.16 12 6.16 6.16 0 0012 5.84zm0 10.16A4 4 0 1116 12a4 4 0 01-4 4zm6.41-8.67a1.44 1.44 0 110-2.88 1.44 1.44 0 010 2.88z" /></svg>
                        </div>
                    </div>
                </div>

                <div className="border-t border-surface pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted">
                    <p>{t('rights')}</p>
                    <div className="flex gap-6">
                        <a href="/privacy" className="hover:text-ink transition-colors">{t('privacy')}</a>
                        <a href="/terms" className="hover:text-ink transition-colors">{t('terms')}</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
