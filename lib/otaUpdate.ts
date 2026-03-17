import { Alert, Platform } from 'react-native';
import { supabase } from './supabase';

// Current app version — must match the version in app.json
const APP_VERSION = '1.0.3';

let isChecking = false;

/**
 * Check for OTA updates from Supabase.
 * - Downloads the bundle silently.
 * - If user has an existing bundle (not first launch), shows a popup to restart.
 * - If first launch (no previous bundle), downloads silently and auto-applies on next app open.
 *
 * Call on AppState "active" and on initial mount.
 */
export async function checkForOtaUpdate(): Promise<void> {
    if (isChecking) return;
    isChecking = true;

    try {
        const hotUpdate = (await import('react-native-ota-hot-update')).default;
        const ReactNativeBlobUtil = (await import('react-native-blob-util')).default;

        const currentBuildNum = (await hotUpdate.getCurrentVersion()) ?? 0;
        const isFirstLaunch = currentBuildNum === 0;

        // Query the update table for a matching from_version, ordered by build_num desc
        const { data, error } = await supabase
            .from('update')
            .select('*')
            .eq('from_version', APP_VERSION)
            .order('build_num', { ascending: false })
            .limit(1)
            .single();

        if (error || !data) return;

        const serverBuildNum: number = data.build_num;
        if (serverBuildNum <= currentBuildNum) return; // Already up to date

        const url = Platform.OS === 'ios' ? data.ios_link : data.android_link;
        if (!url) return;

        console.log(`[OTA] Update available: build ${currentBuildNum} → ${serverBuildNum}`);

        hotUpdate.downloadBundleUri(ReactNativeBlobUtil, url, serverBuildNum, {
            updateSuccess: () => {
                console.log('[OTA] Bundle downloaded successfully.');

                if (isFirstLaunch) {
                    // First launch — don't interrupt, just apply on next app open
                    console.log('[OTA] First launch — update will apply on next restart.');
                    return;
                }

                // Show popup asking user to refresh
                Alert.alert(
                    'Update Available',
                    'A new version is ready. Restart now to apply?',
                    [
                        { text: 'Later', style: 'cancel' },
                        {
                            text: 'Restart',
                            onPress: () => hotUpdate.resetApp(),
                        },
                    ],
                );
            },
            updateFail: (message: string) => {
                console.warn('[OTA] Download failed:', message);
            },
            restartAfterInstall: false, // We handle restart manually via popup
        });
    } catch (err) {
        console.warn('[OTA] Check failed:', err);
    } finally {
        isChecking = false;
    }
}
