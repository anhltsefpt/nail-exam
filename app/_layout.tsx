import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, useColorScheme } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useRevenueCat } from '../hooks/useRevenueCat';
import '../i18n'; // Initialize i18n
import { useUserStore } from '../store/useUserStore';

// Disable system font scaling globally for all Text components
(Text as any).defaultProps = (Text as any).defaultProps || {};
(Text as any).defaultProps.allowFontScaling = false;
(Text as any).defaultProps.maxFontSizeMultiplier = 1;

// Configure RevenueCat synchronously at module level — before any component mounts
const rcApiKey = process.env.EXPO_PUBLIC_RC_API_KEY;
if (rcApiKey) {
  Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  Purchases.configure({ apiKey: rcApiKey });
}

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
  const claimDailyGems = useUserStore((state) => state.claimDailyGems);
  const { isPro } = useRevenueCat();

  useEffect(() => {
    if (language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  // Claim daily free gems on app launch (once per calendar day)
  useEffect(() => {
    claimDailyGems(isPro);
  }, []);

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="paywall" options={{ presentation: 'transparentModal', headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="ai-chat" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="menu" options={{ headerShown: false }} />
        <Stack.Screen name="topic/[topicId]" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
