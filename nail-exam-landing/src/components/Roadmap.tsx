import { useTranslations } from 'next-intl';

const phases = [
    {
        phaseIndex: 1,
        id: 'high-yield-foundations',
        title: 'High-Yield Foundations',
        subtitle: 'Build the knowledge base that covers the majority of exam questions.',
        icon: '🧱',
        accent: 'phase-1',
        topics: [
            'Anatomy & Nail Structure',
            'Sanitation & Disinfection',
            'State Board Laws & Rules',
            'Safety Practices',
        ],
    },
    {
        phaseIndex: 2,
        id: 'core-procedures',
        title: 'Core Procedures',
        subtitle: 'Master the hands-on techniques tested in the practical exam.',
        icon: '💅',
        accent: 'phase-2',
        topics: [
            'Manicure & Pedicure Steps',
            'Nail Extensions & Acrylics',
            'Gel Application',
            'Equipment Handling',
        ],
    },
    {
        phaseIndex: 3,
        id: 'chemistry-theory',
        title: 'Chemistry & Theory',
        subtitle: 'Understand how products work at a molecular level.',
        icon: '⚗️',
        accent: 'phase-3',
        topics: [
            'Monomer & Polymer Science',
            'pH & Cosmetic Chemistry',
            'Allergies & Contraindications',
            'Product Ingredients',
        ],
    },
    {
        phaseIndex: 4,
        id: 'quick-wins',
        title: 'Quick Wins',
        subtitle: 'Lock in easy points with rapid review of frequently tested facts.',
        icon: '⚡',
        accent: 'phase-4',
        topics: [
            'Business & Client Relations',
            'Nail Disorders & Diseases',
            'Infection Control Recap',
            'Exam-Day Tips',
        ],
    },
];

const accentMap: Record<string, { bg: string; light: string; text: string; border: string; badge: string }> = {
    'phase-1': {
        bg: 'bg-phase-1',
        light: 'bg-phase-1-light',
        text: 'text-phase-1',
        border: 'border-phase-1/30',
        badge: 'bg-phase-1/10 text-phase-1',
    },
    'phase-2': {
        bg: 'bg-phase-2',
        light: 'bg-phase-2-light',
        text: 'text-phase-2',
        border: 'border-phase-2/30',
        badge: 'bg-phase-2/10 text-phase-2',
    },
    'phase-3': {
        bg: 'bg-phase-3',
        light: 'bg-phase-3-light',
        text: 'text-phase-3',
        border: 'border-phase-3/30',
        badge: 'bg-phase-3/10 text-phase-3',
    },
    'phase-4': {
        bg: 'bg-phase-4',
        light: 'bg-phase-4-light',
        text: 'text-phase-4',
        border: 'border-phase-4/30',
        badge: 'bg-phase-4/10 text-phase-4',
    },
};

export default function Roadmap() {
    const t = useTranslations('Roadmap');

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4 max-w-6xl">

                {/* Header */}
                <div className="text-center mb-16">
                    <span className="inline-block bg-rose/10 text-rose text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
                        {t('badge')}
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-ink mb-4">
                        {t('header')}
                    </h2>
                    <p className="text-xl text-body max-w-2xl mx-auto">
                        {t('subtitle')}
                    </p>
                </div>

                {/* Phase Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    {phases.map((phase, i) => {
                        const c = accentMap[phase.accent];
                        return (
                            <div
                                key={phase.id}
                                className={`relative rounded-2xl border ${c.border} bg-white p-6 lg:p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-5`}
                            >
                                {/* Phase number — top right */}
                                <span className={`absolute top-5 right-5 text-xs font-bold uppercase tracking-widest ${c.text} opacity-60`}>
                                    Phase {phase.phaseIndex}
                                </span>

                                {/* Icon + Title */}
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl ${c.light} flex items-center justify-center text-2xl shrink-0`}>
                                        {phase.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-ink leading-tight">{phase.title}</h3>
                                        <p className="text-sm text-body mt-0.5">{phase.subtitle}</p>
                                    </div>
                                </div>

                                {/* Connector line between cards (desktop only) */}
                                {i < phases.length - 1 && (
                                    <div className="hidden" />
                                )}

                                {/* Topic chips */}
                                <div className="flex flex-wrap gap-2">
                                    {phase.topics.map(topic => (
                                        <span
                                            key={topic}
                                            className={`text-xs font-medium px-3 py-1.5 rounded-full ${c.badge}`}
                                        >
                                            {topic}
                                        </span>
                                    ))}
                                </div>

                                {/* Progress bar decoration */}
                                <div className="h-1.5 w-full rounded-full bg-surface overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${c.bg} transition-all`}
                                        style={{ width: `${25 * phase.phaseIndex}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom CTA */}
                <div className="mt-16 flex flex-col items-center gap-3 text-center">
                    <p className="text-body text-sm">{t('ctaHint')}</p>
                    <button className="text-white bg-rose hover:bg-rose-dark font-semibold text-lg px-8 py-4 rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-100">
                        {t('exploreCta')}
                    </button>
                </div>

            </div>
        </section>
    );
}
