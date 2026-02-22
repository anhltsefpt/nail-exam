import { Colors } from '@/constants/theme';
import { useUserStore } from '@/store/useUserStore';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const mistakeCount = useUserStore((s) => s.mistakes.length);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mistakes"
        options={{
          title: 'Mistakes',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'close-circle' : 'close-circle-outline'} size={24} color={color} />
          ),
          tabBarBadge: mistakeCount > 0 ? mistakeCount : undefined,
          tabBarBadgeStyle: { backgroundColor: '#E8878C', color: 'white' },
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'menu' : 'menu-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
