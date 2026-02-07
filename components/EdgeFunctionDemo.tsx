import React, { useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../lib/supabase';

export function EdgeFunctionDemo() {
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<string | null>(null);

    const invokeFunction = async () => {
        setLoading(true);
        setResponse(null);
        try {
            const { data, error } = await supabase.functions.invoke('hello-world', {
                body: { name: 'Supabase User' },
            });

            if (error) {
                throw error;
            }

            setResponse(JSON.stringify(data, null, 2));
        } catch (e: any) {
            setResponse(`Error: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Edge Function Demo</Text>
            <Button title="Call 'hello-world'" onPress={invokeFunction} />
            {loading && <ActivityIndicator style={styles.loader} />}
            {response && (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultLabel}>Response:</Text>
                    <Text style={styles.resultText}>{response}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginTop: 20,
        backgroundColor: '#f9f9f9',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    loader: {
        marginTop: 10,
    },
    resultContainer: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#eee',
        borderRadius: 4,
    },
    resultLabel: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    resultText: {
        fontFamily: 'monospace',
        fontSize: 12,
    },
});
