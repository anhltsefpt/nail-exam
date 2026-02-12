import { CongratsModal } from '@/components/CongratsModal';
import { Colors } from '@/constants/theme';
import { useRevenueCat } from '@/hooks/useRevenueCat';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

export default function PaywallScreen() {
    const router = useRouter();
    const { presentPaywall } = useRevenueCat();
    const [congratsVisible, setCongratsVisible] = useState(false);
    const [purchased, setPurchased] = useState(false);

    useEffect(() => {
        const showPaywall = async () => {
            const success = await presentPaywall();
            if (success) {
                setPurchased(true);
                setCongratsVisible(true);
            } else {
                // Cancelled or not presented — just go back
                if (router.canGoBack()) {
                    router.back();
                }
            }
        };

        showPaywall();
    }, []);

    const handleCongratsClose = () => {
        setCongratsVisible(false);
        if (router.canGoBack()) {
            router.back();
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: false,
                    presentation: 'transparentModal',
                    animation: 'fade',
                }}
            />
            <CongratsModal
                visible={congratsVisible}
                onClose={handleCongratsClose}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
});

