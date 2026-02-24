import { useTranslations } from 'next-intl';

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
                    <div className="flex-1 w-full bg-canvas rounded-3xl p-8 relative overflow-hidden h-[400px] shadow-sm border border-border-light hidden md:block">
                        <div className="absolute -right-8 -bottom-8 w-[80%] h-[120%] bg-white rounded-t-3xl border border-border-light shadow-xl p-6 flex flex-col gap-4">
                            <div className="h-4 w-1/3 bg-surface rounded-full mb-2"></div>
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-full p-4 border border-surface rounded-2xl flex gap-4 items-center">
                                    <div className="w-10 h-10 rounded-full bg-info-bg text-info flex items-center justify-center font-bold">{i}</div>
                                    <div className="flex-1">
                                        <div className="h-3 w-3/4 bg-ink/10 rounded-full mb-2"></div>
                                        <div className="h-2 w-1/2 bg-surface rounded-full"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
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
                    <div className="flex-1 w-full bg-canvas rounded-3xl p-8 relative overflow-hidden h-[400px] shadow-sm border border-border-light hidden md:block">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-white rounded-3xl border border-border-light shadow-xl p-4 flex flex-col">
                            <div className="border-b border-surface pb-3 mb-4 flex gap-2 items-center">
                                <div className="w-6 h-6 rounded-full bg-info text-white flex justify-center items-center text-xs">AI</div>
                                <span className="font-semibold text-sm">{t('aiAssistant')}</span>
                            </div>
                            <div className="flex flex-col gap-3">
                                <div className="self-end bg-surface p-3 rounded-2xl rounded-tr-sm max-w-[80%] text-[11px] font-medium">{t('aiQuestion1')}</div>
                                <div className="self-start bg-info-bg p-3 rounded-2xl rounded-tl-sm max-w-[80%] text-[11px] font-medium border border-info/20 text-info leading-relaxed">{t('aiAnswer1')}</div>
                                <div className="self-end bg-surface p-3 rounded-2xl rounded-tr-sm max-w-[80%] text-[11px] font-medium mt-2">{t('aiQuestion2')}</div>
                            </div>
                        </div>
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
