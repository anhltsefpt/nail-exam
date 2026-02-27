import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function FeaturesZigZag() {
    const t = useTranslations('Features');

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4 max-w-6xl">

                {/* Why Finademy Header */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-ink mb-6">{t('whyHeader')}</h2>
                    <p className="text-xl text-body">
                        {t('whySubtitle')}
                    </p>
                </div>

                {/* Feature 1: Structured Lessons */}
                <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20 mb-32">
                    <div className="flex-1 w-full bg-canvas rounded-3xl relative overflow-hidden h-[400px] shadow-sm border border-border-light hidden md:flex items-end justify-center">
                        <Image
                            src="/dashboard.png"
                            alt="NailPrep roadmap dashboard"
                            width={210}
                            height={455}
                            className="object-contain object-bottom drop-shadow-xl"
                        />
                    </div>

                    <div className="flex-1">
                        <div className="inline-block px-3 py-1 bg-rose-light text-rose-dark font-semibold text-sm rounded-full mb-4">{t('stepBadge')}</div>
                        <h3 className="text-3xl md:text-4xl font-bold text-ink mb-6 leading-tight">{t('structuredTitle')}</h3>
                        <p className="text-lg text-body mb-8">
                            {t('structuredDesc')}
                        </p>
                        <button className="flex items-center gap-2 text-white bg-rose hover:bg-rose-dark transition-colors px-6 py-3 rounded-xl font-semibold">
                            {t('learnMore')}
                            <span>→</span>
                        </button>
                    </div>
                </div>

                {/* Feature 2: Smart Feedback */}
                <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-20">
                    <div className="flex-1 w-full bg-canvas rounded-3xl relative overflow-hidden h-[400px] shadow-sm border border-border-light hidden md:flex items-center justify-center">
                        <Image
                            src="/chat-img.png"
                            alt="NailPrep AI chat screen"
                            width={392}
                            height={307}
                            className="object-contain drop-shadow-xl rounded-2xl"
                        />
                    </div>

                    <div className="flex-1">
                        <div className="inline-block px-3 py-1 bg-info-bg text-info font-semibold text-sm rounded-full mb-4">{t('instantBadge')}</div>
                        <h3 className="text-3xl md:text-4xl font-bold text-ink mb-6 leading-tight">{t('smartTitle')}</h3>
                        <p className="text-lg text-body mb-8">
                            {t('smartDesc')}
                        </p>
                        <button className="flex items-center gap-2 text-white bg-info hover:bg-info/80 transition-colors px-6 py-3 rounded-xl font-semibold">
                            {t('learnMore')}
                            <span>→</span>
                        </button>
                    </div>
                </div>

            </div>
        </section>
    );
}
