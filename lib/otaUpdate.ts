import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { showOtaUpdateModal } from '../components/OtaUpdateModal';
import { useUserStore } from '../store/useUserStore';
import { supabase } from './supabase';

// Read app version from app.json via expo-constants
const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

const OTA_LAUNCHED_KEY = 'ota_has_launched';
let isChecking = false;

/**
 * Reset the check lock — call on every AppState change so a new check can run.
 */
export function resetOtaCheckLock() {
    isChecking = false;
}

/**
 * Simple semver compare: returns -1, 0, or 1.
 */
function semverCompare(a: string, b: string): number {
    const pa = a.split('.').map(Number);
    const pb = b.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
        const va = pa[i] || 0;
        const vb = pb[i] || 0;
        if (va < vb) return -1;
        if (va > vb) return 1;
    }
    return 0;
}

/**
 * Check for OTA updates from Supabase.
 * - First launch (no AsyncStorage flag): download silently, no popup.
 * - Subsequent launches: show restart popup.
 */
export async function checkForOtaUpdate(): Promise<void> {
    if (isChecking) return;
    isChecking = true;

    try {
        // If user hasn't completed onboarding, skip the entire check & download.
        // The update will be picked up the next time the app is opened.
        const hasCompletedOnboarding = useUserStore.getState().hasCompletedOnboarding;
        if (!hasCompletedOnboarding) {
            console.log('[OTA] Onboarding not completed — skipping update check.');
            return;
        }

        const hotUpdate = (await import('react-native-ota-hot-update')).default;
        const ReactNativeBlobUtil = (await import('react-native-blob-util')).default;

        const currentBuildNum = (await hotUpdate.getCurrentVersion()) ?? 0;

        // Check first launch via AsyncStorage flag
        const hasLaunchedBefore = await AsyncStorage.getItem(OTA_LAUNCHED_KEY);
        const isFirstLaunch = hasLaunchedBefore === null;
        if (isFirstLaunch) {
            await AsyncStorage.setItem(OTA_LAUNCHED_KEY, '1');
        }

        // Fetch all update records, newest build first
        const { data, error } = await supabase
            .from('update')
            .select('*')
            .order('build_num', { ascending: false });

        if (error || !data || data.length === 0) return;

        // Find the first record where from_version <= APP_VERSION <= to_version
        const update = data.find((row: any) => {
            const fromOk = semverCompare(row.from_version, APP_VERSION) <= 0;
            const toOk = semverCompare(APP_VERSION, row.to_version) <= 0;
            return fromOk && toOk;
        });

        if (!update) return;

        const serverBuildNum: number = update.build_num;
        if (serverBuildNum <= currentBuildNum) return; // Already up to date

        const url = Platform.OS === 'ios' ? update.ios_link : update.android_link;
        if (!url) return;

        console.log(`[OTA] Update available: v${APP_VERSION} build ${currentBuildNum} → build ${serverBuildNum} (target v${update.to_version})`);

        hotUpdate.downloadBundleUri(ReactNativeBlobUtil, url, serverBuildNum, {
            updateSuccess: () => {
                console.log('[OTA] Bundle downloaded successfully.');

                if (isFirstLaunch) {
                    console.log('[OTA] First launch — update will apply on next restart.');
                    return;
                }

                showOtaUpdateModal(() => hotUpdate.resetApp());
            },
            updateFail: (message: string) => {
                console.warn('[OTA] Download failed:', message);
            },
            restartAfterInstall: false,
        });
    } catch (err) {
        console.warn('[OTA] Check failed:', err);
    } finally {
        isChecking = false;
    }
}
