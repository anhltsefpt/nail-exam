import React from 'react';
import { View } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';

interface PaywallProps {
    onDismiss?: () => void;
}

/**
 * RevenueCat native paywall component.
 * Renders the paywall configured in the RevenueCat dashboard.
 * Use this when you want to embed the paywall inline rather than
 * presenting it as a modal via `presentPaywall()`.
 */
export function Paywall({ onDismiss }: PaywallProps) {
    return (
        <View style={{ flex: 1 }}>
            <RevenueCatUI.Paywall
                onDismiss={() => {
                    onDismiss?.();
                }}
                onPurchaseCompleted={() => {
                    onDismiss?.();
                }}
                onRestoreCompleted={() => {
                    // Restore completed — paywall will handle UI
                }}
            />
        </View>
    );
}
