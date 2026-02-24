import { useTranslations } from 'next-intl';

export default function Roadmap() {
    const t = useTranslations('Roadmap');

    const steps = [
        { num: 1, title: t('step1'), color: "bg-phase-1", textColor: "text-white" },
        { num: 2, title: t('step2'), color: "bg-phase-2", textColor: "text-white" },
        { num: 3, title: t('step3'), color: "bg-phase-3", textColor: "text-white" },
        { num: 4, title: t('step4'), color: "bg-phase-4", textColor: "text-white" },
        { num: 5, title: t('step5'), color: "bg-ink", textColor: "text-white" },
        { num: 6, title: t('step6'), color: "bg-info", textColor: "text-white" },
    ];

    return (
        <section className="py-24 bg-canvas">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-ink mb-4">{t('header')}</h2>
                    <p className="text-xl text-body">{t('subtitle')}</p>
                </div>

                {/* Desktop Roadmap curve mockup */}
                <div className="hidden md:flex flex-col items-center relative py-10">

                    <div className="flex flex-wrap justify-center gap-8 lg:gap-16 relative z-10 w-full">
                        {steps.map((step, index) => (
                            <div key={step.num} className={`relative flex flex-col items-center ${index % 2 === 0 ? '-translate-y-6' : 'translate-y-6'}`}>
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl mb-4 shadow-lg ${step.color} ${step.textColor}`}>
                                    {step.num}
                                </div>
                                <div className="bg-white px-4 py-2 rounded-lg shadow-sm font-semibold border border-surface text-ink text-sm w-36 text-center">
                                    {step.title}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="absolute top-1/2 left-0 w-full h-32 -translate-y-1/2 z-0 opacity-20 pointer-events-none">
                        <svg width="100%" height="100%" viewBox="0 0 1000 100" preserveAspectRatio="none">
                            <path d="M0,50 Q250,150 500,50 T1000,50" fill="none" stroke="currentColor" strokeWidth="4" className="text-rose" />
                        </svg>
                    </div>
                </div>

                {/* Mobile vertical version */}
                <div className="md:hidden flex flex-col gap-6 items-center px-4">
                    {steps.map((step) => (
                        <div key={step.num} className="flex items-center gap-4 w-full">
                            <div className={`w-12 h-12 rounded-full flex shrink-0 items-center justify-center font-bold text-lg shadow-sm ${step.color} ${step.textColor}`}>
                                {step.num}
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-surface flex-1 font-semibold text-ink text-sm">
                                {step.title}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-20 flex justify-center text-center">
                    <button className="text-white bg-rose hover:bg-rose-dark font-semibold text-lg px-8 py-4 rounded-xl transition-all shadow-md hover:shadow-lg">
                        {t('exploreCta')}
                    </button>
                </div>

            </div>
        </section>
    );
}
