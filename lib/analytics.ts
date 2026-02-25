import * as amplitude from '@amplitude/analytics-react-native';
import { SessionReplayPlugin } from '@amplitude/plugin-session-replay-react-native';

// ── Keys ───────────────────────────────────────────────
const DEV_KEY = 'e1c2189a2ea60e8ed3fe3ce149c9bdf6';

function getApiKey(): string | null {
    const envKey = process.env.EXPO_PUBLIC_AMPLITUDE_API_KEY;
    if (envKey) return envKey;
    if (__DEV__) return DEV_KEY;
    // No key in production → skip analytics silently
    return null;
}

// ── Init ───────────────────────────────────────────────
let initialised = false;

export async function initAnalytics(): Promise<void> {
    const key = getApiKey();
    if (!key || initialised) return;
    try {
        await amplitude.init(key, undefined, { disableCookies: true }).promise;
        await amplitude.add(new SessionReplayPlugin()).promise;
        initialised = true;
    } catch (e) {
        console.warn('[Analytics] init failed', e);
    }
}

// ── Track ──────────────────────────────────────────────
export function track(
    event: string,
    properties?: Record<string, unknown>,
): void {
    if (!initialised) return;
    amplitude.track(event, properties);
}

// ── Identity ───────────────────────────────────────────
export function identify(userId: string): void {
    if (!initialised) return;
    amplitude.setUserId(userId);
}

export function setUserProperties(
    props: Record<string, unknown>,
): void {
    if (!initialised) return;
    const identifyObj = new amplitude.Identify();
    for (const [key, value] of Object.entries(props)) {
        identifyObj.set(key, value as any);
    }
    amplitude.identify(identifyObj);
}
