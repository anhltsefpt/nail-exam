import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';

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
  useProtectedRoute(user);

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="login" options={{ presentation: 'fullScreenModal', headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="learning-path" options={{ headerShown: false }} />
        <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
