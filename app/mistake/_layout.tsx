import { Stack } from 'expo-router';
import React from 'react';

export default function MistakesLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="[topicId]" />
            <Stack.Screen name="quiz" />
        </Stack>
    );
}
