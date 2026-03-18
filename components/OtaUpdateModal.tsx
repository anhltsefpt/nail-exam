import React, { useCallback, useEffect, useState } from 'react';
import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Module-level callback — set by the component, called by otaUpdate.ts
let _showUpdateModal: (() => void) | null = null;
let _onRestart: (() => void) | null = null;

/** Called from otaUpdate.ts to trigger the modal */
export function showOtaUpdateModal(onRestart: () => void) {
    _onRestart = onRestart;
    _showUpdateModal?.();
}

export default function OtaUpdateModal() {
    const [visible, setVisible] = useState(false);
    const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
    const opacityAnim = React.useRef(new Animated.Value(0)).current;

    // Register the trigger callback
    useEffect(() => {
        _showUpdateModal = () => setVisible(true);
        return () => { _showUpdateModal = null; };
    }, []);

    // Animate in when visible
    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 100, useNativeDriver: true }),
                Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
            ]).start();
        } else {
            scaleAnim.setValue(0.8);
            opacityAnim.setValue(0);
        }
    }, [visible]);

    const handleRestart = useCallback(() => {
        setVisible(false);
        _onRestart?.();
    }, []);

    const handleLater = useCallback(() => {
        setVisible(false);
    }, []);

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
            <View style={styles.overlay}>
                <Animated.View style={[styles.card, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
                    {/* Icon */}
                    <View style={styles.iconWrap}>
                        <Text style={styles.icon}>🚀</Text>
                    </View>

                    <Text style={styles.title}>Update Ready!</Text>
                    <Text style={styles.message}>
                        A new version has been downloaded.{'\n'}Restart now to enjoy the latest features.
                    </Text>

                    {/* Restart button */}
                    <TouchableOpacity style={styles.restartBtn} onPress={handleRestart} activeOpacity={0.85}>
                        <Text style={styles.restartBtnText}>Restart Now</Text>
                    </TouchableOpacity>

                    {/* Later link */}
                    <TouchableOpacity onPress={handleLater} activeOpacity={0.7}>
                        <Text style={styles.laterText}>Maybe Later</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        paddingVertical: 32,
        paddingHorizontal: 28,
        alignItems: 'center',
        width: '100%',
        maxWidth: 340,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 20,
    },
    iconWrap: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FFF5F7',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    icon: {
        fontSize: 32,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 8,
    },
    message: {
        fontSize: 15,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    restartBtn: {
        backgroundColor: '#E8567D',
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 40,
        width: '100%',
        alignItems: 'center',
        marginBottom: 12,
    },
    restartBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    laterText: {
        color: '#94A3B8',
        fontSize: 14,
        fontWeight: '600',
        paddingVertical: 4,
    },
});
