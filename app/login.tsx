import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppleAuthButton } from '../components/AppleAuthButton';

export default function LoginScreen() {
    // const { user } = useAuth(); // Not needed if button handles it, logic is in layout


    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
            <AppleAuthButton style={styles.button} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 40,
    },
    button: {
        width: 250,
        height: 44,
    },
});
