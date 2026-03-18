import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState, StyleSheet, Text, useColorScheme, View } from 'react-native';
import Purchases, { LOG_LEVEL, STOREKIT_VERSION } from 'react-native-purchases';
import { ErrorBoundary } from '../components/ErrorBoundary';
import OtaUpdateModal from '../components/OtaUpdateModal';
import { useRevenueCat } from '../hooks/useRevenueCat';
import '../i18n'; // Initialize i18n
import { getAmplitudeUserId, getDeviceId, identify, initAnalytics, setUserProperties } from '../lib/analytics';
import { checkForOtaUpdate, resetOtaCheckLock } from '../lib/otaUpdate';
import { useUserStore } from '../store/useUserStore';
import OnboardingScreen from './onboarding';

// Disable system font scaling globally for all Text components
(Text as any).defaultProps = (Text as any).defaultProps || {};
(Text as any).defaultProps.allowFontScaling = false;
(Text as any).defaultProps.maxFontSizeMultiplier = 1;

// Configure RevenueCat synchronously at module level — before any component mounts
const rcApiKey = process.env.EXPO_PUBLIC_RC_API_KEY;
if (rcApiKey) {
  Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  Purchases.configure({
    apiKey: rcApiKey,
    storeKitVersion: STOREKIT_VERSION.STOREKIT_2,
  });
}

// Initialize Amplitude analytics
initAnalytics();

// Configure notifications handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ErrorBoundary>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootLayoutNav />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  const { i18n } = useTranslation();
  const language = useUserStore((state) => state.language);
  const setLanguage = useUserStore((state) => state.setLanguage);

  const { isPro, customerInfo } = useRevenueCat();

  const hasCompletedOnboarding = useUserStore((state) => state.hasCompletedOnboarding);
  const setHasCompletedOnboarding = useUserStore((state) => state.setHasCompletedOnboarding);

  // OTA hot update: check on mount + whenever app becomes active
  const appState = useRef(AppState.currentState);
  useEffect(() => {
    checkForOtaUpdate();
    const sub = AppState.addEventListener('change', (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        resetOtaCheckLock();
        checkForOtaUpdate();
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, []);

  // Two-way identity sync: Amplitude ↔ RevenueCat
  // Per https://www.revenuecat.com/docs/integrations/third-party-integrations/amplitude
  useEffect(() => {
    if (!customerInfo?.originalAppUserId) return;

    const rcUserId = customerInfo.originalAppUserId;

    // 1. Set Amplitude userId = RC App User ID so client events are merged
    identify(rcUserId);

    // 2. Set RC subscriber attributes with Amplitude identifiers
    //    so RevenueCat server-side events land on the right Amplitude user
    const amplitudeDeviceId = getDeviceId();
    const amplitudeUserId = getAmplitudeUserId() ?? rcUserId;

    const attrs: Record<string, string> = {
      $amplitudeUserId: amplitudeUserId,
    };
    if (amplitudeDeviceId) {
      attrs.$amplitudeDeviceId = amplitudeDeviceId;
    }
    Purchases.setAttributes(attrs);

    setUserProperties({ isPro, language });
  }, [customerInfo, isPro, language]);

  useEffect(() => {
    if (language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);



  // If user is already Pro but hasn't completed onboarding, skip it
  useEffect(() => {
    if (isPro && !hasCompletedOnboarding) {
      setHasCompletedOnboarding();
    }
  }, [isPro, hasCompletedOnboarding, setHasCompletedOnboarding]);

  const handleOnboardingComplete = (selectedLang: 'en' | 'vi') => {
    setLanguage(selectedLang);
    setHasCompletedOnboarding();
  };

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="paywall" options={{ presentation: 'card', headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="ai-chat" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="menu" options={{ headerShown: false }} />
        <Stack.Screen name="topic/[topicId]" options={{ headerShown: false }} />
        <Stack.Screen name="mistake" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />

      {!hasCompletedOnboarding && (
        <View style={StyleSheet.absoluteFillObject}>
          <OnboardingScreen onComplete={handleOnboardingComplete} />
        </View>
      )}
      <OtaUpdateModal />
    </>
  );
}

