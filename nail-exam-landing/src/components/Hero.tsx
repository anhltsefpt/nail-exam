import { useTranslations } from 'next-intl';

export default function Hero() {
    const t = useTranslations('Hero');

    return (
        <section className="relative overflow-hidden mt-6 pb-20">
            {/* Background gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 bg-canvas">
                <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-rose-light/50 blur-[120px]" />
                <div className="absolute top-[40%] -left-[10%] w-[50%] h-[50%] rounded-full bg-info-bg/40 blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">

                    <div className="flex-1 text-center md:text-left pt-10">
                        <h1 className="text-[3rem] md:text-6xl lg:text-[4.5rem] font-bold tracking-tight text-ink mb-6 leading-tight">
                            {t('title')} <br className="hidden md:block" />
                            <span className="text-rose">{t('titleHighlight')}</span>
                        </h1>
                        <p className="text-xl text-body mb-10 max-w-xl mx-auto md:mx-0">
                            {t('subtitle')}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                            <a href="#" className="w-48 h-14 bg-ink rounded-xl flex items-center justify-center text-white hover:bg-ink/80 transition-all hover:scale-105">
                                <div className="flex items-center gap-2">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M16.365 1.43c0 0-2.03.116-3.713 1.956-1.525 1.667-1.42 3.655-1.42 3.655s1.94-.132 3.513-1.84c1.603-1.742 1.62-3.77 1.62-3.77zM11.968 7.346c-1.92-.093-3.69 1.258-4.54 1.258-.87 0-2.274-1.127-3.76-1.1-1.954.037-3.76 1.134-4.757 2.87-2.025 3.53-5.18 10.59-1.077 14.88 1.01 1.06 2.19 2.27 3.4 2.24 1.157-.035 1.608-.74 3.003-.74 1.385 0 1.782.74 3.013.722 1.28-.016 2.316-1.074 3.298-2.13 1.134-1.216 1.602-2.396 1.602-2.396s-1.66-2.522-1.68-6.195c-.015-3.08 2.507-4.55 2.507-4.55-1.442-2.108-3.662-2.388-4.49-2.456z" /></svg>
                                    <div className="flex flex-col items-start leading-tight">
                                        <span className="text-[10px] text-white/80">{t('appStore')}</span>
                                        <span className="text-xl font-semibold">App Store</span>
                                    </div>
                                </div>
                            </a>

                            <a href="#" className="w-48 h-14 bg-ink rounded-xl flex items-center justify-center text-white hover:bg-ink/80 transition-all hover:scale-105">
                                <div className="flex items-center gap-2">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M3.609 1.814L13.792 12l-10.183 10.186c-.198-.109-.32-.26-.32-.511V2.325c0-.25.122-.4.32-.511z" /><path d="M14.646 12.854l5.42 3.096-3.8-3.8-1.62.704z" /><path d="M4.195 1.31L13.792 12 14.646 11.146 5.8 5.613c-1.05-.65-1.554-.962-1.605-1.064V4.5c.012-.02.012-.112 0-3.19zM14.646 12.854L5.8 18.387c-.05.03-.555-.302-1.605-.964v-.058c.012.02.012.112 0-3.19l8.846-5.534 1.605 4.213z" /></svg>
                                    <div className="flex flex-col items-start leading-tight">
                                        <span className="text-[10px] text-white/80">{t('googlePlay')}</span>
                                        <span className="text-xl font-semibold">Google Play</span>
                                    </div>
                                </div>
                            </a>
                        </div>

                        <div className="mt-8 flex items-center justify-center md:justify-start gap-4 text-sm text-body">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-canvas bg-rose-light flex items-center justify-center overflow-hidden">
                                        <svg className="w-4 h-4 text-rose" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" /></svg>
                                    </div>
                                ))}
                            </div>
                            <p>{t('trustedBy')} <span className="font-semibold text-ink">10,000+</span> {t('traders')}</p>
                        </div>
                    </div>

                    <div className="flex-1 relative mt-16 md:mt-0 flex justify-center perspective-1000 hidden md:flex">
                        {/* Simple mockup replacement for hero to fit NailPrep */}
                        <div className="relative w-72 h-[550px] bg-white rounded-[3rem] border-[8px] border-ink shadow-2xl z-10 overflow-hidden flex flex-col items-center">
                            <div className="absolute top-0 w-32 h-6 bg-ink rounded-b-xl z-20"></div>
                            <div className="w-full h-full bg-canvas flex flex-col p-4 pt-10 relative">
                                <div className="h-10 w-full bg-surface rounded-lg mb-6 flex items-center px-4">
                                    <div className="w-4 h-4 rounded-full bg-info" />
                                </div>

                                <h2 className="text-2xl font-bold text-ink mb-2">Practice Exam</h2>
                                <p className="text-muted text-xs mb-8">State Board Simulated Environment</p>

                                <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
                                    <p className="text-sm font-semibold mb-3">Which of the following is required to be displayed at your workstation?</p>
                                    <div className="space-y-2">
                                        <div className="p-2 bg-surface text-ink text-xs rounded-lg">A) Your original license</div>
                                        <div className="p-2 bg-success-bg border border-success/30 text-success text-xs rounded-lg">B) Sanitation rules</div>
                                        <div className="p-2 bg-surface text-ink text-xs rounded-lg">C) Price list</div>
                                    </div>
                                </div>

                                <div className="absolute bottom-6 left-4 right-4 bg-ink text-white rounded-xl text-center py-3 font-semibold text-sm">Submit Answer</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
