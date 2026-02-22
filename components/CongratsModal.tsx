import { Colors, Radius, Spacing } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown, PartyPopper, Sparkles, X } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Easing,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';

interface CongratsModalProps {
    visible: boolean;
    onClose: () => void;
}

export function CongratsModal({ visible, onClose }: CongratsModalProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const scaleAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const sparkle1 = useRef(new Animated.Value(0)).current;
    const sparkle2 = useRef(new Animated.Value(0)).current;
    const sparkle3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Reset
            scaleAnim.setValue(0);
            rotateAnim.setValue(0);
            sparkle1.setValue(0);
            sparkle2.setValue(0);
            sparkle3.setValue(0);

            // Bounce in
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 6,
                tension: 80,
                useNativeDriver: true,
            }).start();

            // Crown wiggle
            Animated.loop(
                Animated.sequence([
                    Animated.timing(rotateAnim, {
                        toValue: 1,
                        duration: 300,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(rotateAnim, {
                        toValue: -1,
                        duration: 600,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(rotateAnim, {
                        toValue: 0,
                        duration: 300,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ]),
            ).start();

            // Sparkle animations
            const sparkleAnim = (anim: Animated.Value, delay: number) =>
                Animated.loop(
                    Animated.sequence([
                        Animated.delay(delay),
                        Animated.timing(anim, { toValue: 1, duration: 600, useNativeDriver: true }),
                        Animated.timing(anim, { toValue: 0, duration: 600, useNativeDriver: true }),
                    ]),
                );
            sparkleAnim(sparkle1, 0).start();
            sparkleAnim(sparkle2, 400).start();
            sparkleAnim(sparkle3, 800).start();
        }
    }, [visible]);

    const rotate = rotateAnim.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: ['-8deg', '0deg', '8deg'],
    });

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Animated.View
                    style={[
                        styles.container,
                        { backgroundColor: theme.card, transform: [{ scale: scaleAnim }] },
                    ]}
                >
                    {/* Close button */}
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <X size={22} color={theme.textMuted} />
                    </TouchableOpacity>

                    {/* Sparkles */}
                    <Animated.View style={[styles.sparkle, styles.sparkle1, { opacity: sparkle1 }]}>
                        <Sparkles size={20} color="#FBBF24" fill="#FBBF24" />
                    </Animated.View>
                    <Animated.View style={[styles.sparkle, styles.sparkle2, { opacity: sparkle2 }]}>
                        <Sparkles size={16} color="#E8567D" fill="#E8567D" />
                    </Animated.View>
                    <Animated.View style={[styles.sparkle, styles.sparkle3, { opacity: sparkle3 }]}>
                        <Sparkles size={18} color="#3B82F6" fill="#3B82F6" />
                    </Animated.View>

                    {/* Crown icon */}
                    <Animated.View style={{ transform: [{ rotate }] }}>
                        <LinearGradient
                            colors={['#E8567D', '#C24462']}
                            style={styles.iconCircle}
                        >
                            <Crown size={40} color="white" fill="white" />
                        </LinearGradient>
                    </Animated.View>

                    {/* Party popper */}
                    <View style={styles.partyRow}>
                        <PartyPopper size={24} color="#FBBF24" />
                        <Text style={[styles.title, { color: theme.text }]}>
                            Congratulations!
                        </Text>
                        <PartyPopper size={24} color="#FBBF24" style={{ transform: [{ scaleX: -1 }] }} />
                    </View>

                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        You've unlocked{' '}
                        <Text style={{ fontWeight: '700', color: theme.primary }}>NailPrep Premium</Text>
                        ! Enjoy unlimited access to all premium features.
                    </Text>

                    {/* Features */}
                    <View style={[styles.featuresCard, { backgroundColor: theme.backgroundSubtle }]}>
                        {['AI-powered explanations', 'Unlimited mock exams', '805 expert questions'].map(
                            (feature, i) => (
                                <View key={i} style={styles.featureRow}>
                                    <Text style={styles.checkmark}>✅</Text>
                                    <Text style={[styles.featureText, { color: theme.text }]}>
                                        {feature}
                                    </Text>
                                </View>
                            ),
                        )}
                    </View>

                    {/* CTA */}
                    <TouchableOpacity style={styles.ctaBtn} onPress={onClose} activeOpacity={0.85}>
                        <LinearGradient
                            colors={['#E8567D', '#C24A62']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.ctaGradient}
                        >
                            <Text style={styles.ctaText}>Let's Go! 🚀</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '88%',
        borderRadius: Radius.xl,
        padding: Spacing.xl,
        paddingTop: 36,
        alignItems: 'center',
        position: 'relative',
        overflow: 'visible',
    },
    closeBtn: {
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 10,
        padding: 4,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.l,
    },
    partyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: Spacing.s,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: Spacing.l,
        paddingHorizontal: Spacing.s,
    },
    featuresCard: {
        width: '100%',
        borderRadius: Radius.l,
        padding: Spacing.l,
        marginBottom: Spacing.xl,
        gap: 10,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    checkmark: {
        fontSize: 16,
    },
    featureText: {
        fontSize: 14,
        fontWeight: '500',
    },
    ctaBtn: {
        width: '100%',
        borderRadius: Radius.l,
        overflow: 'hidden',
    },
    ctaGradient: {
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctaText: {
        color: 'white',
        fontSize: 17,
        fontWeight: '700',
    },
    sparkle: {
        position: 'absolute',
    },
    sparkle1: {
        top: 20,
        left: 24,
    },
    sparkle2: {
        top: 10,
        right: 40,
    },
    sparkle3: {
        top: 60,
        right: 20,
    },
});
