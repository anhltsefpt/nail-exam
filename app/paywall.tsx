import { Paywall } from '@/components/Paywall';
import { Colors } from '@/constants/theme';
import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function PaywallScreen() {
    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Premium Access', headerStyle: { backgroundColor: Colors.light.background }, headerTintColor: Colors.light.text }} />
            <Paywall />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
        justifyContent: 'center',
    },
});
