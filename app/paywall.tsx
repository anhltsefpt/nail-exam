import { Colors } from '@/constants/theme';
import { useRevenueCat } from '@/hooks/useRevenueCat';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = Colors.light;

// ─── Feature icon — circular pill (matches image) ─────────────────────────────
function FeatureIcon({ icon, accent }: { icon: string; accent: string }) {
    return (
        <View style={[s.featureIconWrap, { backgroundColor: accent + '18' }]}>
            <Text style={s.featureIconText}>{icon}</Text>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function PaywallScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const { product, purchaseProduct, restorePurchases, isReady } = useRevenueCat();

    const [purchasing, setPurchasing] = useState(false);
    const [restoring, setRestoring] = useState(false);

    // Subtle entrance animation on the badge
    const animIn = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.spring(animIn, {
            toValue: 1,
            tension: 55,
            friction: 7,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleClose = () => router.back();

    const handlePurchase = async () => {
        if (!product) return;
        setPurchasing(true);
        const success = await purchaseProduct(product);
        setPurchasing(false);
        if (success) router.back();
    };

    const handleRestore = async () => {
        setRestoring(true);
        const success = await restorePurchases();
        setRestoring(false);
        if (success) router.back();
    };

    const FEATURES = [
        { icon: '🤖', title: t('paywall.features.aiTitle'), desc: t('paywall.features.aiDesc'), accent: C.primary },
        { icon: '⚡', title: t('paywall.features.examsTitle'), desc: t('paywall.features.examsDesc'), accent: '#8B5CF6' },
        { icon: '✅', title: t('paywall.features.questionsTitle'), desc: t('paywall.features.questionsDesc'), accent: '#0891B2' },
    ];

    return (
        <View style={[s.root, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }]}>

            {/* ── Header: title + close ── */}
            <View style={s.header}>
                <Text style={s.headerTitle}>{t('paywall.title')} <Text style={{ color: C.primary }}>{t('paywall.premium')}</Text></Text>
                <TouchableOpacity onPress={handleClose} hitSlop={12} style={s.closeBtn}>
                    <Text style={s.closeBtnText}>✕</Text>
                </TouchableOpacity>
            </View>

            {/* ── Badge icon ── */}
            <Animated.View style={[
                s.badgeWrap,
                {
                    opacity: animIn,
                    transform: [
                        { scale: animIn.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) },
                    ],
                },
            ]}>
                <View style={s.badge}>
                    <Text style={s.badgeEmoji}>👑</Text>
                </View>
            </Animated.View>

            {/* ── Subtitle ── */}
            <Text style={s.subtitle}>{t('paywall.subtitle')}</Text>

            {/* ── Features ── */}
            <View style={s.features}>
                {FEATURES.map((f, i) => (
                    <View key={i} style={s.featureRow}>
                        <FeatureIcon icon={f.icon} accent={f.accent} />
                        <View style={s.featureBody}>
                            <Text style={s.featureTitle}>{f.title}</Text>
                            <Text style={s.featureDesc}>{f.desc}</Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* ── Price summary ── */}
            <View style={s.priceSummary}>
                {!isReady ? (
                    <ActivityIndicator color={C.primary} />
                ) : product ? (
                    <View style={s.priceRow}>
                        <Text style={s.priceAmount}>{product.priceString}</Text>
                        <Text style={s.pricePeriod}>
                            {(() => {
                                const sub = product.subscriptionPeriod ?? '';
                                if (sub.includes('Y')) return t('paywall.pricing.perYear');
                                if (sub.includes('M')) return t('paywall.pricing.perMonth');
                                if (sub.includes('W')) return t('paywall.pricing.perWeek');
                                return '';
                            })()}
                        </Text>
                    </View>
                ) : null}
            </View>

            {/* ── CTA button ── */}
            <View style={s.ctaArea}>
                <TouchableOpacity
                    style={[s.ctaBtn, { opacity: purchasing || !product ? 0.6 : 1 }]}
                    onPress={handlePurchase}
                    disabled={purchasing || !product}
                    activeOpacity={0.85}
                >
                    {purchasing
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={s.ctaBtnText}>{t('paywall.cta.tryForFree')}</Text>
                    }
                </TouchableOpacity>

                <Text style={s.legal}>{t('paywall.cta.legal')}</Text>

                <View style={s.footerLinks}>
                    <TouchableOpacity onPress={handleRestore} disabled={restoring}>
                        {restoring
                            ? <ActivityIndicator size="small" color={C.textMuted} />
                            : <Text style={s.footerLink}>{t('paywall.cta.restorePurchases')}</Text>
                        }
                    </TouchableOpacity>
                    <Text style={[s.footerLink, { color: C.border }]}>·</Text>
                    <TouchableOpacity onPress={handleClose}>
                        <Text style={s.footerLink}>{t('paywall.cta.freePlan')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 24,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        position: 'relative',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: C.text,
        letterSpacing: -0.2,
    },
    closeBtn: {
        position: 'absolute',
        right: 0,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 15,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    closeBtnText: {
        fontSize: 14,
        color: C.textMuted,
        fontWeight: '600',
    },

    // Badge
    badgeWrap: {
        alignItems: 'center',
        marginBottom: 16,
    },
    badge: {
        width: 96,
        height: 96,
        borderRadius: 28,
        backgroundColor: C.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: C.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    badgeEmoji: { fontSize: 44 },

    // Subtitle
    subtitle: {
        fontSize: 16,
        fontWeight: '500',
        color: C.text,
        textAlign: 'center',
        marginBottom: 28,
    },

    // Features
    features: {
        marginBottom: 24,
        gap: 4,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 14,
        paddingVertical: 10,
    },
    featureIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    featureIconText: { fontSize: 18 },
    featureBody: { flex: 1, paddingTop: 2 },
    featureTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: C.text,
        marginBottom: 2,
    },
    featureDesc: {
        fontSize: 12,
        color: C.textSecondary,
        lineHeight: 17,
    },

    // CTA
    ctaArea: { gap: 10 },
    priceSummary: { alignItems: 'center', paddingVertical: 12, gap: 4 },
    priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
    priceAmount: { fontSize: 28, fontWeight: '900', color: C.text },
    pricePeriod: { fontSize: 14, fontWeight: '500', color: C.textMuted },
    ctaBtn: {
        backgroundColor: C.primary,
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        shadowColor: C.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    ctaBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: -0.2,
    },
    legal: {
        fontSize: 11,
        color: C.textMuted,
        textAlign: 'center',
    },
    footerLinks: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    footerLink: {
        fontSize: 11,
        color: C.textMuted,
        fontWeight: '500',
    },
});
