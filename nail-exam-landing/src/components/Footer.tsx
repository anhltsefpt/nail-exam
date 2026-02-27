import { Link } from '@/i18n/routing';
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

                    <a
                        href="mailto:contact@nail-prep.com"
                        className="flex items-center gap-2 text-sm text-body hover:text-rose transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                        contact@nail-prep.com
                    </a>
                </div>

                <div className="border-t border-surface pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted">
                    <p>{t('rights')}</p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-ink transition-colors">{t('privacy')}</Link>
                        <Link href="/terms" className="hover:text-ink transition-colors">{t('terms')}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
