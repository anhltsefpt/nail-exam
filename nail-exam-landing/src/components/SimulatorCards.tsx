import { useTranslations } from 'next-intl';

export default function SimulatorCards() {
    const t = useTranslations('Simulator');

    const cards = [
        {
            title: t('card1Title'),
            desc: t('card1Desc'),
            imageColor: "bg-surface",
            btnText: t('card1Btn')
        },
        {
            title: t('card2Title'),
            desc: t('card2Desc'),
            imageColor: "bg-surface",
            btnText: t('card2Btn')
        },
        {
            title: t('card3Title'),
            desc: t('card3Desc'),
            imageColor: "bg-surface",
            btnText: t('card3Btn')
        }
    ];

    return (
        <section className="py-24 bg-canvas">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-ink mb-4 max-w-3xl mx-auto leading-tight">
                        {t('header')}
                    </h2>
                    <p className="text-xl text-body">{t('subtitle')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {cards.map((card, idx) => (
                        <div key={idx} className="bg-white rounded-[2rem] p-6 border border-border-light shadow-sm flex flex-col items-center text-center transition-transform hover:-translate-y-2">
                            <div className={`w-full h-48 rounded-xl ${card.imageColor} mb-6 overflow-hidden relative flex flex-col justify-end px-4`}>
                                <div className="w-full h-3/4 bg-white rounded-t-xl border border-border-light shadow-lg opacity-80" />
                            </div>
                            <h3 className="text-xl font-bold text-ink mb-3">{card.title}</h3>
                            <p className="text-body text-sm mb-6 flex-1">{card.desc}</p>
                            <button className="w-full py-3 rounded-lg border-2 border-border-light text-ink font-semibold hover:border-ink hover:bg-canvas transition-colors">
                                {card.btnText}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
