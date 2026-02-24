'use client';

import { usePathname, useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const toggleLocale = () => {
        const nextLocale = locale === 'en' ? 'vi' : 'en';
        router.replace({ pathname }, { locale: nextLocale });
    };

    return (
        <button
            onClick={toggleLocale}
            className="px-3 py-1.5 rounded-full border border-border-light text-sm font-semibold text-ink hover:bg-surface transition-colors flex items-center gap-2"
        >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            {locale === 'en' ? 'Tiếng Việt' : 'English'}
        </button>
    );
}
