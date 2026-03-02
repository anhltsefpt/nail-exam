import { Colors } from '@/constants/theme';
import { ENTITLEMENT_ID } from '@/hooks/useRevenueCat';
import { track } from '@/lib/analytics';
import { useUserStore } from '@/store/useUserStore';
import { Experiment } from '@amplitude/experiment-react-native-client';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Animated,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Purchases from 'react-native-purchases';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ==================== DESIGN TOKENS ====================
// Single source of truth — all values come from the design system
const C = Colors.light;
const T = {
    // Brand
    rose: C.primary,
    roseLight: C.primaryLight,
    roseDark: C.primaryDark,
    roseWhisper: C.backgroundSubtle,
    // Text
    ink: C.text,
    body: C.textSecondary,
    muted: C.textMuted,
    // Surface
    borderLight: C.borderLight,
    canvas: C.canvas,
    white: C.card,
    // Semantic
    success: C.success,
    successBg: C.successBg,
    successText: '#166534',   // dark green — not in Colors, kept explicit
    error: C.error,
    errorBg: C.errorBg,
    errorText: '#991B1B',   // dark red — not in Colors, kept explicit
    warning: C.warning,
    warningBg: C.warningBg,
    warningText: '#92400E',   // dark amber — not in Colors, kept explicit
    star: C.starGold,
};

// ==================== MINI QUIZ DATA (Moved inside component for i18n) ====================

// ==================== HELPERS ====================
function CheckIcon({ size = 14, color = 'white' }: { size?: number; color?: string }) {
    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: size * 0.9, color, fontWeight: '800' }}>✓</Text>
        </View>
    );
}

function ProgressDots({ current, total }: { current: number; total: number }) {
    return (
        <View style={styles.progressDots}>
            {Array.from({ length: total }, (_, i) => (
                <View
                    key={i}
                    style={[
                        styles.dot,
                        {
                            width: current === i ? 24 : 8,
                            backgroundColor:
                                current === i ? T.rose : i < current ? `${T.rose}80` : T.borderLight,
                        },
                    ]}
                />
            ))}
        </View>
    );
}

function BottomCTA({
    text,
    onPress,
    disabled,
    emoji,
}: {
    text: string;
    onPress: () => void;
    disabled?: boolean;
    emoji?: string;
}) {
    return (
        <View style={styles.ctaWrapper}>
            <TouchableOpacity
                onPress={disabled ? undefined : onPress}
                activeOpacity={disabled ? 1 : 0.85}
                style={[styles.ctaBtn, disabled && styles.ctaBtnDisabled]}
            >
                <Text style={[styles.ctaBtnText, disabled && styles.ctaBtnTextDisabled]}>
                    {emoji ? `${emoji} ` : ''}
                    {text}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

// Animated counter component
function Counter({ target, duration = 1500 }: { target: number; duration?: number }) {
    const [val, setVal] = useState(0);
    useEffect(() => {
        let current = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                setVal(target);
                clearInterval(timer);
            } else {
                setVal(Math.floor(current));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [target, duration]);
    return <Text style={styles.counterText}>{val.toLocaleString()}</Text>;
}

// Animated progress ring using Animated API
function AnimRing({
    target,
    delay = 0,
    size = 80,
    color = T.rose,
}: {
    target: number;
    delay?: number;
    size?: number;
    color?: string;
}) {
    const progress = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        const t = setTimeout(() => {
            Animated.timing(progress, {
                toValue: target,
                duration: 1200,
                useNativeDriver: false,
            }).start();
        }, delay);
        return () => clearTimeout(t);
    }, [target, delay]);

    const strokeWidth = 5;
    const radius = (size - strokeWidth * 2) / 2;
    const circumference = 2 * Math.PI * radius;

    // We can't do SVG stroke-dashoffset animation natively, so we fake it with
    // a rotating arc drawn as a thick border with clip.
    // Simple approach: use borderRadius circle with a conic-like approach via transform.
    // For RN we'll use two semicircles (simple but effective).
    const pct = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 360] });

    return (
        <View style={{ width: size, height: size, position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
            {/* Track */}
            <View
                style={{
                    position: 'absolute',
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderWidth: strokeWidth,
                    borderColor: `${color}20`,
                }}
            />
            {/* Progress arc – approximated via border trick */}
            <Animated.View
                style={{
                    position: 'absolute',
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderWidth: strokeWidth,
                    borderColor: color,
                    borderRightColor: 'transparent',
                    borderBottomColor: target > 0.5 ? color : 'transparent',
                    transform: [{ rotate: pct.interpolate({ inputRange: [0, 360], outputRange: ['-90deg', '270deg'] }) }],
                }}
            />
        </View>
    );
}

// ==================== MAIN COMPONENT ====================
interface OnboardingProps {
    onComplete: (language: 'en' | 'vi') => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingProps) {
    const { t, i18n } = useTranslation();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const setStoreLanguage = useUserStore((state) => state.setLanguage);

    const [enable_free_onboarding, setEnableFreeOnboarding] = useState(false);

    useEffect(() => {
        const fetchExperiment = async () => {
            try {
                // Initialize Amplitude Experiment SDK (Needs an API key)
                const expKey = process.env.EXPO_PUBLIC_AMPLITUDE_EXPERIMENT_API_KEY || process.env.EXPO_PUBLIC_AMPLITUDE_API_KEY || '';
                if (!expKey) return;

                const experiment = Experiment.initialize(expKey);
                await experiment.fetch();

                const variant = experiment.variant('enable_free_onboarding');
                const isEnabled = variant?.value === true || variant?.value === 'true';
                setEnableFreeOnboarding(isEnabled);
            } catch (error) {
                console.warn('[Experiment] fetch wrapper failed:', error);
            }
        };
        fetchExperiment();
    }, []);

    const [step, setStep] = useState(0);
    const [lang, setLang] = useState<'en' | 'vi' | null>(null);
    const [examDate, setExamDate] = useState<string | null>(null);
    const [studyTime, setStudyTime] = useState<string | null>(null);
    const [experience, setExperience] = useState<string | null>(null);
    const [quizQ, setQuizQ] = useState(0);
    const [quizAns, setQuizAns] = useState<string | null>(null);
    const [quizShow, setQuizShow] = useState(false);
    const [quizScore, setQuizScore] = useState(0);
    const [paywallPending, setPaywallPending] = useState(false);
    const [showProSuccess, setShowProSuccess] = useState(false);

    const MINI_QUIZ = [
        {
            q: t('onboarding.miniQuiz.q1'),
            a: t('onboarding.miniQuiz.q1a'),
            b: t('onboarding.miniQuiz.q1b'),
            c: t('onboarding.miniQuiz.q1c'),
            d: t('onboarding.miniQuiz.q1d'),
            ans: 'B',
        },
        {
            q: t('onboarding.miniQuiz.q2'),
            a: t('onboarding.miniQuiz.q2a'),
            b: t('onboarding.miniQuiz.q2b'),
            c: t('onboarding.miniQuiz.q2c'),
            d: t('onboarding.miniQuiz.q2d'),
            ans: 'C',
        },
        {
            q: t('onboarding.miniQuiz.q3'),
            a: t('onboarding.miniQuiz.q3a'),
            b: t('onboarding.miniQuiz.q3b'),
            c: t('onboarding.miniQuiz.q3c'),
            d: t('onboarding.miniQuiz.q3d'),
            ans: 'B',
        },
    ];

    const fadeAnim = useRef(new Animated.Value(1)).current;

    const goNext = () => {
        Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
            const nextStep = step + 1;
            setStep(nextStep);
            track('onboarding_step_viewed', { step: nextStep, lang: lang ?? 'unknown' });
            Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
        });
    };

    // When we return from the paywall (opened from AI card), check if purchase succeeded
    useFocusEffect(
        useCallback(() => {
            if (!paywallPending) return;
            const checkPurchase = async () => {
                try {
                    const info = await Purchases.getCustomerInfo();
                    const paid = info.entitlements.active[ENTITLEMENT_ID] !== undefined;
                    setPaywallPending(false);
                    if (paid) {
                        track('onboarding_paywall_purchase_success', { lang: lang ?? 'unknown' });
                        setShowProSuccess(true);
                    } else {
                        track('onboarding_paywall_dismissed_from_showcase', { lang: lang ?? 'unknown' });
                        // Stay on step 6
                    }
                } catch {
                    setPaywallPending(false);
                }
            };
            checkPurchase();
        }, [paywallPending])
    );

    const pickQuizAns = (letter: string) => {
        if (quizShow) return;
        setQuizAns(letter);
        setQuizShow(true);
        if (letter === MINI_QUIZ[quizQ].ans) setQuizScore((s) => s + 1);
    };

    const quizNext = () => {
        if (quizQ < 2) {
            track('onboarding_quiz_answer', { question: quizQ + 1, correct: quizAns === MINI_QUIZ[quizQ].ans, lang: lang ?? 'unknown' });
            setQuizQ((q) => q + 1);
            setQuizAns(null);
            setQuizShow(false);
        } else {
            track('onboarding_quiz_answer', { question: 3, correct: quizAns === MINI_QUIZ[quizQ].ans, lang: lang ?? 'unknown' });
            track('onboarding_quiz_completed', { score: quizScore + (quizAns === MINI_QUIZ[quizQ].ans ? 1 : 0), lang: lang ?? 'unknown' });
            Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
                setStep(8);
                track('onboarding_step_viewed', { step: 8, lang: lang ?? 'unknown' });
                Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
            });
        }
    };

    const handleComplete = () => {
        track('onboarding_completed', { lang: lang ?? 'en', quiz_score: quizScore });
        onComplete(lang ?? 'en');
    };

    const dailyStudySets = studyTime === '10' ? 1 : studyTime === '20' ? 2 : studyTime === '30' ? 4 : 6;
    const studyDays = examDate === '1w' ? 7 : examDate === '2w' ? 14 : 30;

    // Pass probability formula based on user inputs
    const passPct = Math.min(98, Math.max(81, (
        70 // base
        + (experience === 'done' ? 10 : experience === 'retake' ? 7 : experience === 'mid' ? 4 : 2) // experience
        + (studyTime === '60' ? 14 : studyTime === '30' ? 9 : studyTime === '20' ? 5 : 1) // study time
        + (examDate === '1m' ? 6 : examDate === '2w' ? 2 : examDate === 'idk' ? 4 : -4) // exam urgency
    )));

    return (
        <View style={styles.root}>
            <StatusBar barStyle={step === 0 ? "dark-content" : "dark-content"} />

            <Animated.View style={[styles.content, { opacity: fadeAnim }, step > 0 && { paddingTop: insets.top }]}>
                {/* ==================== STEP 0: SPLASH ==================== */}
                {step === 0 && (
                    <View style={styles.splashBg}>
                        {/* Floating emojis */}
                        {['💅', '✨', '💎', '🌸', '🧴', '💕'].map((e, i) => (
                            <Text
                                key={i}
                                style={[
                                    styles.floatingEmoji,
                                    {
                                        left: `${15 + (i * 13) % 70}%` as any,
                                        top: `${10 + (i * 17) % 50}%` as any,
                                        fontSize: 20 + (i % 3) * 8,
                                    },
                                ]}
                            >
                                {e}
                            </Text>
                        ))}

                        <View style={styles.splashCenter}>
                            {/* Logo */}
                            <View style={styles.logoBox}>
                                <Text style={styles.logoEmoji}>💅</Text>
                            </View>
                            <Text style={styles.appTitle}>{t('onboarding.splash.title')}</Text>
                            <Text style={styles.appSubtitle}>{t('onboarding.splash.subtitle')}</Text>
                            <Text style={styles.appMeta}>{t('onboarding.splash.meta')}</Text>

                            {/* Social proof */}
                            <View style={styles.socialProof}>
                                <View style={styles.avatarRow}>
                                    {['🧑‍🦰', '👩', '👩‍🦱', '🧑'].map((a, i) => (
                                        <View key={i} style={[styles.avatar, i > 0 && { marginLeft: -8 }]}>
                                            <Text style={styles.avatarEmoji}>{a}</Text>
                                        </View>
                                    ))}
                                </View>
                                <Text style={styles.socialText}>{t('onboarding.splash.socialText')}</Text>
                            </View>
                        </View>

                        {/* Bottom CTA */}
                        <View style={[styles.splashCta, { paddingBottom: insets.bottom + 24 }]}>
                            <TouchableOpacity onPress={() => { track('onboarding_splash_cta_tapped', {}); goNext(); }} style={styles.splashBtn} activeOpacity={0.85}>
                                <Text style={styles.splashBtnText}>{t('onboarding.splash.getStarted')}</Text>
                            </TouchableOpacity>
                            <Text style={styles.splashFree}>{t('onboarding.splash.freeInfo')}</Text>
                        </View>
                    </View>
                )}

                {/* ==================== STEP 1: LANGUAGE ==================== */}
                {step === 1 && (
                    <View style={styles.stepContainer}>
                        <ProgressDots current={0} total={5} />
                        <View style={styles.stepBody}>
                            <Text style={styles.stepEmoji}>🌐</Text>
                            <Text style={styles.stepTitle}>{t('onboarding.language.title')}</Text>
                            <Text style={styles.stepSub}>{t('onboarding.language.subtitle')}</Text>

                            {[
                                { code: 'en' as const, flag: '🇺🇸', name: t('onboarding.language.enName'), sub: t('onboarding.language.enSub') },
                                { code: 'vi' as const, flag: '🇻🇳', name: t('onboarding.language.viName'), sub: t('onboarding.language.viSub') },
                            ].map((l) => (
                                <TouchableOpacity
                                    key={l.code}
                                    onPress={() => {
                                        setLang(l.code);
                                        track('onboarding_language_selected', { language: l.code });
                                    }}
                                    activeOpacity={0.85}
                                    style={[
                                        styles.optionCard,
                                        lang === l.code && styles.optionCardSelected,
                                        { marginBottom: 12 },
                                    ]}
                                >
                                    <Text style={styles.optionFlag}>{l.flag}</Text>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.optionName, lang === l.code && { color: T.rose }]}>{l.name}</Text>
                                        <Text style={styles.optionSubtext}>{l.sub}</Text>
                                    </View>
                                    {lang === l.code && (
                                        <View style={styles.checkCircle}>
                                            <CheckIcon size={16} color="white" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                        <BottomCTA text={t('onboarding.continue')} onPress={() => {
                            if (lang) {
                                i18n.changeLanguage(lang);
                                setStoreLanguage(lang);
                            }
                            goNext();
                        }} disabled={!lang} />
                    </View>
                )}

                {/* ==================== STEP 2: EXPERIENCE ==================== */}
                {step === 2 && (
                    <View style={styles.stepContainer}>
                        <ProgressDots current={1} total={5} />
                        <View style={styles.stepBody}>
                            <Text style={styles.stepEmoji}>📚</Text>
                            <Text style={styles.stepTitle}>{t('onboarding.experience.title')}</Text>
                            <Text style={styles.stepSubMuted}>{t('onboarding.experience.subtitle')}</Text>

                            {[
                                { id: 'new', emoji: '🌱', title: t('onboarding.experience.start'), sub: t('onboarding.experience.startSub') },
                                { id: 'mid', emoji: '📖', title: t('onboarding.experience.school'), sub: t('onboarding.experience.schoolSub') },
                                { id: 'done', emoji: '🎓', title: t('onboarding.experience.done'), sub: t('onboarding.experience.doneSub') },
                                { id: 'retake', emoji: '🔄', title: t('onboarding.experience.retake'), sub: t('onboarding.experience.retakeSub') },
                            ].map((o) => (
                                <TouchableOpacity
                                    key={o.id}
                                    onPress={() => { setExperience(o.id); track('onboarding_experience_selected', { value: o.id, lang: lang ?? 'unknown' }); }}
                                    activeOpacity={0.85}
                                    style={[styles.optionCardSm, experience === o.id && styles.optionCardSelected]}
                                >
                                    <Text style={styles.optionEmojiSm}>{o.emoji}</Text>
                                    <View>
                                        <Text style={[styles.optionNameSm, experience === o.id && { color: T.rose }]}>
                                            {o.title}
                                        </Text>
                                        <Text style={styles.optionSubtext}>{o.sub}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <BottomCTA text={t('onboarding.continue')} onPress={() => { track('onboarding_experience_confirmed', { value: experience, lang: lang ?? 'unknown' }); goNext(); }} disabled={!experience} />
                    </View>
                )}

                {/* ==================== STEP 3: EXAM DATE ==================== */}
                {step === 3 && (
                    <View style={styles.stepContainer}>
                        <ProgressDots current={2} total={5} />
                        <View style={styles.stepBody}>
                            <Text style={styles.stepEmoji}>📅</Text>
                            <Text style={styles.stepTitle}>{t('onboarding.examDate.title')}</Text>
                            <Text style={styles.stepSubMuted}>{t('onboarding.examDate.subtitle')}</Text>

                            {[
                                { id: '1w', emoji: '🔴', text: t('onboarding.examDate.week1'), sub: t('onboarding.examDate.week1Sub') },
                                { id: '2w', emoji: '🟡', text: t('onboarding.examDate.week2'), sub: t('onboarding.examDate.week2Sub') },
                                { id: '1m', emoji: '🟢', text: t('onboarding.examDate.month1'), sub: t('onboarding.examDate.month1Sub') },
                                { id: 'idk', emoji: '🤷', text: t('onboarding.examDate.idk'), sub: t('onboarding.examDate.idkSub') },
                            ].map((o) => (
                                <TouchableOpacity
                                    key={o.id}
                                    onPress={() => { setExamDate(o.id); track('onboarding_exam_date_selected', { value: o.id, lang: lang ?? 'unknown' }); }}
                                    activeOpacity={0.85}
                                    style={[styles.optionCardSm, examDate === o.id && styles.optionCardSelected]}
                                >
                                    <Text style={styles.optionEmojiSm}>{o.emoji}</Text>
                                    <View>
                                        <Text style={[styles.optionNameSm, examDate === o.id && { color: T.rose }]}>
                                            {o.text}
                                        </Text>
                                        <Text style={styles.optionSubtext}>{o.sub}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <BottomCTA text={t('onboarding.continue')} onPress={() => { track('onboarding_exam_date_confirmed', { value: examDate, lang: lang ?? 'unknown' }); goNext(); }} disabled={!examDate} />
                    </View>
                )}

                {/* ==================== STEP 4: STUDY TIME ==================== */}
                {step === 4 && (
                    <View style={styles.stepContainer}>
                        <ProgressDots current={3} total={5} />
                        <View style={styles.stepBody}>
                            <Text style={styles.stepEmoji}>⏱️</Text>
                            <Text style={styles.stepTitle}>{t('onboarding.studyTime.title')}</Text>
                            <Text style={styles.stepSubMuted}>{t('onboarding.studyTime.subtitle')}</Text>

                            {[
                                { id: '10', text: t('onboarding.studyTime.min10'), sub: t('onboarding.studyTime.min10Sub'), emoji: '☕' },
                                { id: '20', text: t('onboarding.studyTime.min20'), sub: t('onboarding.studyTime.min20Sub'), emoji: '📱' },
                                { id: '30', text: t('onboarding.studyTime.min30'), sub: t('onboarding.studyTime.min30Sub'), emoji: '💪' },
                                { id: '60', text: t('onboarding.studyTime.min60'), sub: t('onboarding.studyTime.min60Sub'), emoji: '🔥' },
                            ].map((o) => (
                                <TouchableOpacity
                                    key={o.id}
                                    onPress={() => { setStudyTime(o.id); track('onboarding_study_time_selected', { value: o.id, lang: lang ?? 'unknown' }); }}
                                    activeOpacity={0.85}
                                    style={[styles.optionCardSm, studyTime === o.id && styles.optionCardSelected]}
                                >
                                    <Text style={styles.optionEmojiSm}>{o.emoji}</Text>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.optionNameSm, studyTime === o.id && { color: T.rose }]}>
                                            {o.text}
                                        </Text>
                                        <Text style={styles.optionSubtext}>{o.sub}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <BottomCTA text={t('onboarding.studyTime.btn')} onPress={() => { track('onboarding_study_time_confirmed', { value: studyTime, lang: lang ?? 'unknown' }); goNext(); }} disabled={!studyTime} />
                    </View>
                )}

                {/* ==================== STEP 5: PERSONALIZED PLAN ==================== */}
                {step === 5 && (
                    <View style={styles.stepContainer}>
                        <ProgressDots current={4} total={5} />
                        <View style={styles.planScrollBody}>
                            {/* Header — inline / compact */}
                            <View style={styles.planHeader}>
                                <Text style={styles.planEmoji}>🎯</Text>
                                <View>
                                    <Text style={styles.planTitle}>{t('onboarding.plan.title')}</Text>
                                    <Text style={styles.planSub}>{t('onboarding.plan.subtitle')}</Text>
                                </View>
                            </View>

                            {/* Stats cards */}
                            <View style={styles.statsRow}>
                                {[
                                    { label: t('onboarding.plan.statQuestions'), value: 805, color: T.rose, emoji: '❓' },
                                    { label: t('onboarding.plan.statStudyDays'), value: studyDays, color: '#8B5CF6', emoji: '📅' },
                                    { label: t('onboarding.plan.statSetsDay'), value: dailyStudySets, color: T.success, emoji: '📚' },
                                ].map((s, i) => (
                                    <View key={i} style={[styles.statCard, { borderColor: `${s.color}30` }]}>
                                        <Text style={styles.statEmoji}>{s.emoji}</Text>
                                        <Text style={[styles.statNum, { color: s.color }]}>
                                            <Counter target={s.value} duration={900 + i * 250} />
                                        </Text>
                                        <Text style={styles.statLabel}>{s.label}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* Pass probability — horizontal layout to save space */}
                            <View style={styles.probCard}>
                                <View style={styles.probRingWrap}>
                                    <AnimRing target={passPct / 100} size={90} color={T.success} delay={300} />
                                    <View style={styles.probRingCenter}>
                                        <Text style={styles.probPct}>{passPct}%</Text>
                                        <Text style={styles.probPctLabel}>{t('onboarding.plan.passObj')}</Text>
                                    </View>
                                </View>
                                <View style={styles.probRight}>
                                    <Text style={styles.probCardTitle}>{t('onboarding.plan.probTitle')}</Text>
                                    <Text style={styles.probDesc}>
                                        {passPct >= 90
                                            ? t('onboarding.plan.probHigh')
                                            : passPct >= 82
                                                ? t('onboarding.plan.probMed')
                                                : t('onboarding.plan.probLow')}
                                    </Text>
                                    <View style={styles.probBreakdown}>
                                        {[
                                            { label: experience === 'done' ? t('onboarding.plan.tagGraduate') : experience === 'retake' ? t('onboarding.plan.tagRetaking') : experience === 'mid' ? t('onboarding.plan.tagInSchool') : t('onboarding.plan.tagBeginner'), color: '#8B5CF6' },
                                            { label: t('onboarding.plan.tagMinDay').replace('{{time}}', studyTime || ''), color: T.rose },
                                        ].map((b, i) => (
                                            <View key={i} style={[styles.probPill, { backgroundColor: `${b.color}18`, borderColor: `${b.color}40` }]}>
                                                <Text style={[styles.probPillText, { color: b.color }]}>{b.label}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </View>

                            {/* Roadmap preview */}
                            <View style={styles.roadmapCard}>
                                <View style={styles.roadmapBar}>
                                    {[
                                        { c: T.rose, n: 9 },
                                        { c: '#8B5CF6', n: 6 },
                                        { c: '#0891B2', n: 2 },
                                        { c: T.success, n: 3 },
                                    ].map((p, i) => (
                                        <View key={i} style={[styles.roadmapSegment, { flex: p.n, backgroundColor: p.c }]} />
                                    ))}
                                </View>
                                <View style={styles.roadmapLegend}>
                                    {[
                                        { c: T.rose, l: t('onboarding.plan.rmSafety') },
                                        { c: '#8B5CF6', l: t('onboarding.plan.rmScience') },
                                        { c: '#0891B2', l: t('onboarding.plan.rmSkin') },
                                        { c: T.success, l: t('onboarding.plan.rmBusiness') },
                                    ].map((p, i) => (
                                        <View key={i} style={styles.legendItem}>
                                            <View style={[styles.legendDot, { backgroundColor: p.c }]} />
                                            <Text style={styles.legendText}>{p.l}</Text>
                                        </View>
                                    ))}
                                </View>
                                <Text style={[styles.roadmapMeta, { marginTop: 6 }]}>{t('onboarding.plan.roadmapMeta')}</Text>
                            </View>
                        </View>
                        <BottomCTA text={t('onboarding.plan.btn')} onPress={() => { track('onboarding_plan_viewed', { pass_pct: passPct, lang: lang ?? 'unknown' }); goNext(); }} emoji="💪" />
                    </View>
                )}

                {/* ==================== STEP 6: FEATURE SHOWCASE ==================== */}
                {step === 6 && !showProSuccess && (
                    <View style={styles.stepContainer}>
                        <View style={[styles.stepBody, { justifyContent: 'center' }]}>
                            <View style={{ alignItems: 'center', marginBottom: 24 }}>
                                <Text style={styles.stepTitle}>{t('onboarding.showcase.title')}</Text>
                                <Text style={styles.stepSubMuted}>{t('onboarding.showcase.subtitle')}</Text>
                            </View>

                            {[
                                {
                                    icon: '🗺️', color: T.rose, bg: T.roseWhisper,
                                    title: t('onboarding.showcase.roadmap'),
                                    desc: t('onboarding.showcase.roadmapDesc'),
                                    onTap: undefined as (() => void) | undefined,
                                },
                                {
                                    icon: '🤖', color: '#8B5CF6', bg: '#EDE9FE',
                                    title: t('onboarding.showcase.ai'),
                                    desc: t('onboarding.showcase.aiDesc'),
                                    onTap: () => {
                                        track('onboarding_ai_feature_tapped', { lang: lang ?? 'unknown' });
                                        track('onboarding_paywall_opened_from_showcase', { lang: lang ?? 'unknown' });
                                        setPaywallPending(true);
                                        router.push('/paywall');
                                    },
                                },
                                {
                                    icon: '🇻🇳', color: '#0891B2', bg: '#ECFEFF',
                                    title: t('onboarding.showcase.bilingual'),
                                    desc: t('onboarding.showcase.bilingualDesc'),
                                    onTap: undefined as (() => void) | undefined,
                                },
                            ].map((f, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={[styles.featureCard, f.onTap && { borderColor: '#8B5CF6', borderWidth: 2 }]}
                                    activeOpacity={f.onTap ? 0.75 : 1}
                                    onPress={f.onTap}
                                    disabled={!f.onTap}
                                >
                                    <View style={[styles.featureIcon, { backgroundColor: f.bg }]}>
                                        <Text style={styles.featureIconEmoji}>{f.icon}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.featureTitle}>{f.title}</Text>
                                        <Text style={styles.featureDesc}>{f.desc}</Text>
                                    </View>
                                    {f.onTap && (
                                        <Text style={{ fontSize: 11, color: '#8B5CF6', fontWeight: '700' }}>
                                            {t('onboarding.showcase.aiPaywallHint')}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                        <BottomCTA text={t('onboarding.showcase.btn')} onPress={() => { track('onboarding_showcase_viewed', { lang: lang ?? 'unknown' }); goNext(); }} emoji="⚡" />
                    </View>
                )}

                {/* ==================== STEP 6.5: PRO UNLOCKED ==================== */}
                {showProSuccess && step === 6 && (
                    <View style={styles.stepContainer}>
                        <View style={[styles.stepBody, { justifyContent: 'center', alignItems: 'center' }]}>
                            {/* Crown badge */}
                            <View style={styles.proUnlockedBadge}>
                                <Text style={styles.proUnlockedBadgeEmoji}>👑</Text>
                            </View>
                            <Text style={styles.proUnlockedTitle}>{t('onboarding.proUnlocked.title')}</Text>
                            <Text style={styles.proUnlockedSub}>{t('onboarding.proUnlocked.subtitle')}</Text>

                            {/* Unlocked features */}
                            <View style={styles.proUnlockedFeatures}>
                                {[
                                    { icon: '🤖', label: t('onboarding.proUnlocked.feat1') },
                                    { icon: '🏆', label: t('onboarding.proUnlocked.feat3') },
                                ].map((f, i) => (
                                    <View key={i} style={styles.proUnlockedPill}>
                                        <Text style={styles.proUnlockedPillIcon}>{f.icon}</Text>
                                        <Text style={styles.proUnlockedPillText}>{f.label}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                        <BottomCTA
                            text={t('onboarding.proUnlocked.cta')}
                            emoji="⚡"
                            onPress={() => {
                                track('onboarding_pro_unlocked_quiz_started', { lang: lang ?? 'unknown' });
                                setShowProSuccess(false);
                                goNext();
                            }}
                        />
                    </View>
                )}

                {/* ==================== STEP 7: MINI QUIZ ==================== */}
                {step === 7 && (
                    <View style={[styles.stepContainer, { paddingHorizontal: 0 }]}>
                        {/* Progress bar — matches quiz screen header style */}
                        <View style={styles.quizHeader}>
                            <View style={styles.quizHeaderRow}>
                                <Text style={styles.quizLabel}>{t('onboarding.miniQuiz.header')}</Text>
                                <Text style={styles.quizCounter}>{t('onboarding.miniQuiz.questionProgress').replace('{{current}}', `${quizQ + 1}`).replace('{{total}}', '3')}</Text>
                            </View>
                            <View style={styles.quizTrack}>
                                <View style={[styles.quizProgress, { width: `${((quizQ + 1) / 3) * 100}%` as any }]} />
                            </View>
                        </View>

                        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.quizBody}>
                            {/* Question */}
                            <Text style={styles.quizQuestionText}>{MINI_QUIZ[quizQ].q}</Text>

                            {/* Options — match real quiz card style */}
                            <View style={styles.quizOptionsWrap}>
                                {(['A', 'B', 'C', 'D'] as const).map((letter) => {
                                    const txt = MINI_QUIZ[quizQ][letter.toLowerCase() as 'a' | 'b' | 'c' | 'd'];
                                    const isSel = quizAns === letter;
                                    const isCor = letter === MINI_QUIZ[quizQ].ans;

                                    let optionExtraStyle = {};
                                    let borderColor = '#E6E1E2';
                                    let radioNode: React.ReactNode;

                                    if (quizShow) {
                                        if (isCor) {
                                            optionExtraStyle = styles.quizOptCorrect;
                                            borderColor = '#7EC8A4';
                                            radioNode = (
                                                <View style={[styles.quizIconCircle, { backgroundColor: '#7EC8A4' }]}>
                                                    <CheckIcon size={14} color="white" />
                                                </View>
                                            );
                                        } else if (isSel && !isCor) {
                                            optionExtraStyle = styles.quizOptWrong;
                                            borderColor = '#E8878C';
                                            radioNode = (
                                                <View style={[styles.quizIconCircle, { backgroundColor: '#E8878C' }]}>
                                                    <Text style={{ color: 'white', fontSize: 13, fontWeight: '700', lineHeight: 14 }}>✕</Text>
                                                </View>
                                            );
                                        } else {
                                            radioNode = <View style={styles.quizRadioOuter} />;
                                        }
                                    } else if (isSel) {
                                        optionExtraStyle = styles.quizOptSelected;
                                        borderColor = T.rose;
                                        radioNode = (
                                            <View style={[styles.quizRadioOuter, { borderColor: T.rose }]}>
                                                <View style={[styles.quizRadioInner, { backgroundColor: T.rose }]} />
                                            </View>
                                        );
                                    } else {
                                        radioNode = <View style={styles.quizRadioOuter} />;
                                    }

                                    return (
                                        <TouchableOpacity
                                            key={letter}
                                            onPress={() => pickQuizAns(letter)}
                                            disabled={quizShow}
                                            activeOpacity={0.7}
                                            style={[styles.quizOpt, optionExtraStyle, { borderColor }]}
                                        >
                                            <Text style={[styles.quizOptText, quizShow && isCor && { color: '#166534' }, quizShow && isSel && !isCor && { color: '#991B1B' }]}>{txt}</Text>
                                            {radioNode}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* Feedback teaser after answering */}
                            {quizShow && (
                                <View style={styles.quizFeedbackCard}>
                                    <Text style={styles.quizFeedbackIcon}>💡</Text>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.quizFeedbackTitle}>
                                            {quizAns === MINI_QUIZ[quizQ].ans ? t('onboarding.miniQuiz.feedbackCorrect') : t('onboarding.miniQuiz.feedbackWrong')}
                                        </Text>
                                        <Text style={styles.quizFeedbackSub}>
                                            {quizAns === MINI_QUIZ[quizQ].ans
                                                ? t('onboarding.miniQuiz.feedbackCorrectSub')
                                                : t('onboarding.miniQuiz.feedbackWrongSub')}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </ScrollView>

                        {/* Sticky footer — matches quiz screen bottom bar */}
                        <View style={styles.quizStickyFooter}>
                            <TouchableOpacity
                                onPress={quizShow ? quizNext : undefined}
                                disabled={!quizShow}
                                activeOpacity={0.8}
                                style={[styles.quizContinueBtn, !quizShow && styles.quizContinueBtnDisabled]}
                            >
                                <Text style={[styles.quizContinueBtnText, !quizShow && { color: T.muted }]}>
                                    {quizShow ? (quizQ < 2 ? t('onboarding.miniQuiz.btnNext') : t('onboarding.miniQuiz.btnResult')) : t('onboarding.miniQuiz.btnWait')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* ==================== STEP 8: RESULTS + SOFT PAYWALL ==================== */}
                {step === 8 && (
                    <View style={styles.resultsContainer}>
                        <Text style={styles.resultsBigEmoji}>
                            {quizScore === 3 ? '🌟' : quizScore >= 2 ? '💪' : '📚'}
                        </Text>
                        <Text style={styles.resultsTitle}>
                            {quizScore === 3 ? t('onboarding.results.titleAmazing') : quizScore >= 2 ? t('onboarding.results.titleGreat') : t('onboarding.results.titleGood')}
                        </Text>
                        <Text style={styles.resultsSubtitle}>{t('onboarding.results.subtitle').replace('{{score}}', `${quizScore}`)}</Text>

                        {/* Score ring */}
                        <View style={styles.resultsRingWrap}>
                            <AnimRing
                                target={quizScore / 3}
                                size={72}
                                color={quizScore >= 2 ? T.success : T.warning}
                                delay={300}
                            />
                            <View style={styles.resultsRingCenter}>
                                <Text style={styles.resultsRingText}>{Math.round((quizScore / 3) * 100)}%</Text>
                            </View>
                        </View>

                        {/* Personalized message */}
                        <View style={[styles.resultsMsg, { backgroundColor: quizScore >= 2 ? T.successBg : T.warningBg }]}>
                            <Text style={[styles.resultsMsgText, { color: quizScore >= 2 ? T.successText : T.warningText }]}>
                                {quizScore === 3
                                    ? t('onboarding.results.msgHigh')
                                    : quizScore === 2
                                        ? t('onboarding.results.msgMed')
                                        : t('onboarding.results.msgLow')}
                            </Text>
                        </View>

                        {/* What you get */}
                        <Text style={styles.resultsPlanHeader}>{t('onboarding.results.planHeader')}</Text>
                        {[
                            { icon: '🗺️', text: t('onboarding.results.planRoadmap'), free: true },
                            { icon: '❓', text: t('onboarding.results.planQuestions'), free: true },
                            { icon: '🇻🇳', text: t('onboarding.results.planBilingual'), free: true },
                            { icon: '🤖', text: t('onboarding.results.planAi'), free: false },
                            { icon: '⚡', text: t('onboarding.results.planExams'), free: false },
                        ].map((f, i, arr) => (
                            <View key={i} style={[styles.planRow, i < arr.length - 1 && styles.planRowBorder]}>
                                <Text style={styles.planIcon}>{f.icon}</Text>
                                <Text style={styles.planText}>{f.text}</Text>
                                <View style={[styles.planBadge, { backgroundColor: f.free ? T.successBg : T.roseLight }]}>
                                    <Text style={[styles.planBadgeText, { color: f.free ? T.success : T.rose }]}>
                                        {f.free ? t('onboarding.results.badgeFree') : t('onboarding.results.badgePro')}
                                    </Text>
                                </View>
                            </View>
                        ))}

                        {/* CTA */}
                        <TouchableOpacity
                            onPress={handleComplete}
                            style={styles.startBtn}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.startBtnText}>{t('onboarding.results.btnStartLearning')}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </Animated.View>
        </View>
    );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: T.white,
    },
    content: {
        flex: 1,
    },

    // --- Splash ---
    splashBg: {
        flex: 1,
        backgroundColor: T.roseLight,
        // Gradient approximated – top rose to dark
    },
    floatingEmoji: {
        position: 'absolute',
        opacity: 0.15,
    },
    splashCenter: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 36,
    },
    logoBox: {
        width: 88,
        height: 88,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.6)',
    },
    logoEmoji: { fontSize: 44 },
    appTitle: {
        fontSize: 38,
        fontWeight: '800',
        color: T.ink,
        letterSpacing: -1.5,
        marginBottom: 6,
    },
    appSubtitle: {
        fontSize: 15,
        color: T.roseDark,
        fontWeight: '500',
        marginBottom: 8,
    },
    appMeta: {
        fontSize: 13,
        color: T.body,
        marginBottom: 40,
    },
    socialProof: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    avatarRow: { flexDirection: 'row' },
    avatar: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: T.roseLight,
    },
    avatarEmoji: { fontSize: 14 },
    socialText: {
        fontSize: 12,
        color: T.roseDark,
        fontWeight: '600',
    },
    splashCta: {
        paddingHorizontal: 28,
    },
    splashBtn: {
        backgroundColor: T.rose,
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: T.rose,
        shadowOpacity: 0.2,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
    },
    splashBtnText: {
        fontSize: 17,
        fontWeight: '800',
        color: 'white',
    },
    splashFree: {
        fontSize: 11,
        color: T.muted,
        textAlign: 'center',
        marginTop: 12,
    },

    // --- Step layout ---
    stepContainer: {
        flex: 1,
        backgroundColor: T.white,
        paddingHorizontal: 28,
    },
    stepBody: {
        flex: 1,
        justifyContent: 'center',
        paddingTop: 8,
    },
    stepEmoji: { fontSize: 36, marginBottom: 12 },
    stepTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: T.ink,
        marginBottom: 6,
        letterSpacing: -0.5,
    },
    stepSub: {
        fontSize: 14,
        color: T.muted,
        marginBottom: 28,
    },
    stepSubMuted: {
        fontSize: 14,
        color: T.muted,
        marginBottom: 24,
    },

    // --- Progress dots ---
    progressDots: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
        paddingTop: 16,
        paddingBottom: 4,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },

    // --- Option cards ---
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: T.borderLight,
        backgroundColor: T.white,
        gap: 16,
    },
    optionCardSelected: {
        borderColor: T.rose,
        backgroundColor: T.roseWhisper,
        borderWidth: 2.5,
    },
    optionFlag: { fontSize: 36 },
    optionName: {
        fontSize: 17,
        fontWeight: '700',
        color: T.ink,
    },
    optionSubtext: {
        fontSize: 12,
        color: T.muted,
        marginTop: 2,
    },
    checkCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: T.rose,
        alignItems: 'center',
        justifyContent: 'center',
    },

    optionCardSm: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: T.borderLight,
        backgroundColor: T.white,
        gap: 14,
        marginBottom: 10,
    },
    optionEmojiSm: { fontSize: 24 },
    optionNameSm: {
        fontSize: 14,
        fontWeight: '700',
        color: T.ink,
    },

    // --- CTA ---
    ctaWrapper: { paddingBottom: 32 },
    ctaBtn: {
        backgroundColor: T.rose,
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: T.rose,
        shadowOpacity: 0.3,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    ctaBtnDisabled: {
        backgroundColor: T.borderLight,
        shadowOpacity: 0,
        elevation: 0,
    },
    ctaBtnText: {
        fontSize: 16,
        fontWeight: '800',
        color: 'white',
    },
    ctaBtnTextDisabled: {
        color: T.muted,
    },

    // --- Plan screen (step 5) ---
    planScrollBody: {
        flex: 1,
        paddingHorizontal: 16,
        paddingBottom: 12,
        paddingTop: 4,
    },
    planHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    planEmoji: {
        fontSize: 36,
    },
    planTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: T.ink,
        letterSpacing: -0.3,
        lineHeight: 22,
    },
    planSub: {
        fontSize: 12,
        color: T.muted,
        marginTop: 2,
    },

    // --- Stats row ---
    statsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 10,
    },
    statCard: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 6,
        borderRadius: 14,
        backgroundColor: T.canvas,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: T.borderLight,
        gap: 2,
    },
    statEmoji: {
        fontSize: 16,
    },
    statNum: {
        fontSize: 18,
        fontWeight: '800',
        color: T.rose,
    },
    counterText: {
        fontSize: 18,
        fontWeight: '800',
        color: T.rose,
    },
    statLabel: {
        fontSize: 9,
        color: T.muted,
        fontWeight: '600',
        textAlign: 'center',
    },

    // --- Pass probability card (redesigned) ---
    probCard: {
        borderRadius: 16,
        backgroundColor: T.successBg,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        marginBottom: 12,
        gap: 12,
        borderWidth: 1,
        borderColor: `${T.success}30`,
    },
    probCardTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: T.successText,
        letterSpacing: 0.3,
        marginBottom: 4,
    },
    probRingWrap: {
        width: 90,
        height: 90,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    probRingCenter: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    probRight: {
        flex: 1,
    },
    probPct: {
        fontSize: 22,
        fontWeight: '900',
        color: T.successText,
        lineHeight: 26,
    },
    probPctLabel: {
        fontSize: 9,
        fontWeight: '600',
        color: T.success,
    },
    probDesc: {
        fontSize: 13,
        fontWeight: '600',
        color: T.successText,
        marginBottom: 8,
        lineHeight: 18,
    },
    probNote: {
        fontSize: 10,
        color: T.success,
        textAlign: 'center',
        marginBottom: 10,
    },
    probBreakdown: {
        flexDirection: 'row',
        gap: 6,
        flexWrap: 'wrap',
    },
    probPill: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 50,
        borderWidth: 1,
    },
    probPillText: {
        fontSize: 10,
        fontWeight: '600',
    },


    // --- Roadmap ---
    roadmapCard: {
        padding: 14,
        borderRadius: 14,
        backgroundColor: T.canvas,
        borderWidth: 1,
        borderColor: T.borderLight,
    },
    roadmapLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: T.muted,
        marginBottom: 10,
        letterSpacing: 1,
    },
    roadmapBar: {
        flexDirection: 'row',
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
        gap: 2,
    },
    roadmapSegment: {
        height: 8,
        borderRadius: 4,
    },
    roadmapLegend: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12,
        justifyContent: 'center',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: 10,
        color: T.muted,
        fontWeight: '500',
    },
    roadmapFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    roadmapMeta: {
        fontSize: 10,
        color: T.muted,
    },

    // --- Feature showcase ---
    featureCard: {
        flexDirection: 'row',
        gap: 14,
        padding: 16,
        borderRadius: 16,
        backgroundColor: T.canvas,
        borderWidth: 1,
        borderColor: T.borderLight,
        marginBottom: 10,
    },
    featureIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    featureIconEmoji: { fontSize: 24 },
    featureTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: T.ink,
        marginBottom: 2,
    },
    featureDesc: {
        fontSize: 12,
        color: T.muted,
        lineHeight: 18,
    },

    // --- Mini Quiz ---
    quizHeader: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 10,
        backgroundColor: T.white,
        borderBottomWidth: 1,
        borderBottomColor: T.borderLight,
    },
    quizHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    quizLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: T.rose,
    },
    quizCounter: {
        fontSize: 12,
        color: T.muted,
        fontWeight: '600',
    },
    quizTrack: {
        height: 6,
        backgroundColor: T.borderLight,
        borderRadius: 3,
        overflow: 'hidden',
    },
    quizProgress: {
        height: 6,
        backgroundColor: T.rose,
        borderRadius: 3,
    },
    quizBody: {
        padding: 16,
        paddingHorizontal: 16,
        flexGrow: 1,
    },
    quizQuestionText: {
        fontSize: 20,
        fontWeight: '700',
        color: T.ink,
        lineHeight: 28,
        marginBottom: 24,
    },
    // New option styles matching [categoryId].tsx
    quizOptionsWrap: {
        gap: 12,
    },
    quizOpt: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        backgroundColor: T.canvas,
    },
    quizOptSelected: {
        backgroundColor: 'rgba(242, 167, 179, 0.08)',
        borderWidth: 2,
    },
    quizOptCorrect: {
        backgroundColor: 'rgba(126, 200, 164, 0.15)',
        borderWidth: 2,
    },
    quizOptWrong: {
        backgroundColor: 'rgba(232, 135, 140, 0.12)',
        borderWidth: 2,
    },
    quizOptText: {
        flex: 1,
        fontSize: 15,
        color: T.ink,
        lineHeight: 22,
    },
    // Radio indicator (unselected / selected)
    quizRadioOuter: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: T.borderLight,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    quizRadioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    // Icon circle for correct / wrong
    quizIconCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    // Feedback card below options
    quizFeedbackCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 12,
        borderRadius: 12,
        backgroundColor: T.canvas,
        borderWidth: 1,
        borderColor: T.borderLight,
        marginTop: 16,
    },
    quizFeedbackIcon: { fontSize: 18 },
    quizFeedbackTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: T.ink,
    },
    quizFeedbackSub: {
        fontSize: 11,
        color: T.muted,
    },
    // Sticky footer bar
    quizStickyFooter: {
        borderTopWidth: 1,
        borderTopColor: T.borderLight,
        backgroundColor: T.white,
        paddingHorizontal: 20,
        paddingVertical: 14,
        paddingBottom: 28,
    },
    quizContinueBtn: {
        borderRadius: 50,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: T.rose,
        shadowColor: T.rose,
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    quizContinueBtnDisabled: {
        backgroundColor: T.borderLight,
        shadowOpacity: 0,
        elevation: 0,
    },
    quizContinueBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: T.white,
    },


    // --- Results ---
    resultsContainer: {
        flex: 1,
        backgroundColor: T.white,
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 8,
        alignItems: 'center',
    },
    resultsTopRow: {}, // unused but kept to avoid ref error
    resultsTitleWrap: {},
    resultsBigEmoji: { fontSize: 36, marginBottom: 4 },
    resultsTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: T.ink,
        marginBottom: 2,
    },
    resultsSubtitle: {
        fontSize: 12,
        color: T.muted,
        marginBottom: 10,
    },
    resultsRingWrap: {
        width: 72,
        height: 72,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    resultsRingCenter: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    resultsRingText: {
        fontSize: 18,
        fontWeight: '800',
        color: T.ink,
    },
    resultsMsg: {
        padding: 10,
        borderRadius: 12,
        width: '100%',
        marginBottom: 10,
    },
    resultsMsgText: {
        fontSize: 12,
        fontWeight: '600',
        lineHeight: 17,
        textAlign: 'center',
    },
    resultsPlanHeader: {
        fontSize: 10,
        fontWeight: '700',
        color: T.muted,
        letterSpacing: 1,
        alignSelf: 'flex-start',
        marginBottom: 6,
    },
    planRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 7,
        width: '100%',
    },
    planRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: T.borderLight,
    },
    planIcon: { fontSize: 18 },
    planText: {
        flex: 1,
        fontSize: 13,
        fontWeight: '600',
        color: T.ink,
    },
    planBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    planBadgeText: {
        fontSize: 10,
        fontWeight: '700',
    },
    startBtn: {
        backgroundColor: T.rose,
        borderRadius: 14,
        paddingVertical: 13,
        width: '100%',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: T.rose,
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
        elevation: 5,
        marginBottom: 6,
    },
    startBtnText: {
        fontWeight: '800',
        fontSize: 16,
        color: 'white',
    },
    premiumLink: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        padding: 10,
        marginBottom: 4,
    },
    premiumLinkEmoji: { fontSize: 12 },
    premiumLinkText: {
        fontSize: 12,
        fontWeight: '600',
        color: T.muted,
    },
    premiumLinkArrow: {
        fontSize: 10,
        color: T.muted,
    },
    footerNote: {
        fontSize: 10,
        color: `${T.muted}90`,
        textAlign: 'center',
        marginBottom: 4,
    },

    // --- Pro Unlocked step ---
    proUnlockedBadge: {
        width: 96,
        height: 96,
        borderRadius: 28,
        backgroundColor: '#8B5CF6',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
        elevation: 10,
    },
    proUnlockedBadgeEmoji: { fontSize: 44 },
    proUnlockedTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: T.ink,
        letterSpacing: -0.5,
        marginBottom: 8,
        textAlign: 'center',
    },
    proUnlockedSub: {
        fontSize: 14,
        color: T.body,
        textAlign: 'center',
        marginBottom: 28,
        lineHeight: 20,
        paddingHorizontal: 8,
    },
    proUnlockedFeatures: {
        width: '100%',
        gap: 10,
    },
    proUnlockedPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#F3F0FF',
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#DDD6FE',
    },
    proUnlockedPillIcon: { fontSize: 20 },
    proUnlockedPillText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#5B21B6',
    },
});
