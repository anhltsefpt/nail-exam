import React from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PurchasesPackage } from 'react-native-purchases';
import { Colors, Radius, Spacing, Typography } from '../constants/theme';
import { useRevenueCat } from '../hooks/useRevenueCat';

export function Paywall() {
    const { currentOffering, purchasePackage, restorePurchases } = useRevenueCat();

    const onPurchase = async (pack: PurchasesPackage) => {
        const success = await purchasePackage(pack);
        if (success) {
            Alert.alert('Success', 'Purchase successful!');
        }
    };

    const onRestore = async () => {
        const success = await restorePurchases();
        if (success) {
            Alert.alert('Success', 'Purchases restored!');
        } else {
            Alert.alert('Error', 'Failed to restore purchases.');
        }
    };

    if (!currentOffering) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Unlock Premium</Text>
            <Text style={styles.subtitle}>Get access to all learning paths and features.</Text>

            {currentOffering.availablePackages.map((pack) => (
                <TouchableOpacity
                    key={pack.identifier}
                    style={styles.packageButton}
                    onPress={() => onPurchase(pack)}
                >
                    <Text style={styles.packageTitle}>{pack.product.title}</Text>
                    <Text style={styles.packagePrice}>{pack.product.priceString}</Text>
                </TouchableOpacity>
            ))}

            <TouchableOpacity onPress={onRestore} style={styles.restoreButton}>
                <Text style={styles.restoreText}>Restore Purchases</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: Spacing.xl,
        backgroundColor: Colors.light.card,
        borderRadius: Radius.l,
        margin: Spacing.m,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    loadingContainer: {
        padding: Spacing.xl,
        alignItems: 'center',
    },
    title: {
        ...Typography.sizes.xl,
        fontWeight: 'bold',
        color: Colors.light.text,
        textAlign: 'center',
        marginBottom: Spacing.s,
    },
    subtitle: {
        ...Typography.sizes.s,
        color: Colors.light.textMuted,
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
    packageButton: {
        backgroundColor: Colors.light.primary,
        padding: Spacing.l,
        borderRadius: Radius.m,
        marginBottom: Spacing.m,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    packageTitle: {
        color: Colors.light.primaryForeground,
        fontWeight: '600',
        flex: 1,
        marginRight: Spacing.s,
    },
    packagePrice: {
        color: Colors.light.primaryForeground,
        fontWeight: 'bold',
    },
    restoreButton: {
        marginTop: Spacing.m,
        alignItems: 'center',
    },
    restoreText: {
        color: Colors.light.textMuted,
        textDecorationLine: 'underline',
    },
});
