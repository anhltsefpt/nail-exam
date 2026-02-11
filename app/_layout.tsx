import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';
import '../i18n'; // Initialize i18n
import { useUserStore } from '../store/useUserStore';

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

function useProtectedRoute(user: any) {
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) return;

    const inAuthGroup = segments[0] === '(tabs)';

    if (
      // If the user is not signed in and the initial segment is not anything in the auth group.
      !user &&
      inAuthGroup
    ) {
      // Redirect to the sign-in page.
      // Use setTimeout to avoid 'Attempted to navigate before mounting' error
      /* setTimeout(() => {
        router.replace('/login');
      }, 0); */
    } else if (user && !inAuthGroup) {
      // Redirect away from the sign-in page.
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 0);
    }
  }, [user, segments, navigationState?.key]);
}


export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // if (process.env.EXPO_PUBLIC_RC_API_KEY) {
    //   Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
    //   Purchases.configure({ apiKey: process.env.EXPO_PUBLIC_RC_API_KEY });
    // }
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </ThemeProvider>
  );
}

function RootLayoutNav() {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const language = useUserStore((state) => state.language);

  useEffect(() => {
    if (language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  useProtectedRoute(user);

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="login" options={{ presentation: 'fullScreenModal', headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
        <Stack.Screen name="ai-chat" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="menu" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
