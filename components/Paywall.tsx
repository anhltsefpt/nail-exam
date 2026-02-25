/**
 * Paywall component — navigates to the custom paywall screen.
 * Use `router.push('/paywall')` directly in your code,
 * or render this component to trigger the paywall programmatically.
 */
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

interface PaywallProps {
    onDismiss?: () => void;
}

/**
 * Immediately opens the custom paywall modal when rendered.
 * Prefer calling `router.push('/paywall')` directly.
 */
export function Paywall({ onDismiss }: PaywallProps) {
    const router = useRouter();

    useEffect(() => {
        router.push('/paywall');
        return () => {
            onDismiss?.();
        };
    }, []);

    return null;
}
