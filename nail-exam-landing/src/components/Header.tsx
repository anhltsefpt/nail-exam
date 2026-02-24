import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import Image from "next/image";
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
    const t = useTranslations('Header');

    return (
        <header className="sticky top-0 z-50 w-full bg-canvas/90 backdrop-blur-md border-b border-border-light">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
                <Link href="/" className="flex items-center gap-2">
                    {/* Logo copied from React Native app */}
                    <Image src="/icon.png" alt="NailPrep Logo" width={32} height={32} className="rounded-md" />
                    <span className="font-bold text-xl text-ink tracking-tight">NailPrep</span>
                </Link>
                <nav className="flex gap-6 items-center">
                    <div className="hidden md:flex gap-6">
                        <Link href="/" className="text-body font-medium hover:text-rose transition-colors text-sm">{t('home')}</Link>
                        <Link href="/privacy" className="text-body font-medium hover:text-rose transition-colors text-sm">{t('privacy')}</Link>
                        <Link href="/terms" className="text-body font-medium hover:text-rose transition-colors text-sm">{t('terms')}</Link>
                    </div>
                    <LanguageSwitcher />
                </nav>
            </div>
        </header>
    );
}
