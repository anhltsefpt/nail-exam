import { MultipleChoiceQuestion } from '@/components/quiz/MultipleChoiceQuestion';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Separator } from '@/components/ui/Separator';
import { Typography } from '@/components/ui/Typography';
import { Colors, Spacing } from '@/constants/theme';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, useColorScheme, View } from 'react-native';

export default function DesignSystemGallery() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: Spacing.m,
      backgroundColor: theme.background,
    },
    section: {
      marginVertical: Spacing.l,
      gap: Spacing.m,
    },
    row: {
      flexDirection: 'row',
      gap: Spacing.m,
      flexWrap: 'wrap',
    },
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Design System Gallery',
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Typography variant="display" color="primary">
            Vibrant Design
          </Typography>
          <Typography variant="body" color="muted">
            This is a gallery of all reusable components.
          </Typography>
        </View>

        <Separator />

        {/* Buttons */}
        <View style={styles.section}>
          <Typography variant="heading">Buttons</Typography>
          <View style={styles.row}>
            <Button label="Primary" onPress={() => {}} />
            <Button label="Secondary" variant="secondary" onPress={() => {}} />
          </View>
          <View style={styles.row}>
            <Button label="Outline" variant="outline" onPress={() => {}} />
            <Button label="Ghost" variant="ghost" onPress={() => {}} />
          </View>
          <View style={styles.row}>
            <Button label="Destructive" variant="destructive" icon="trash" onPress={() => {}} />
            <Button label="Loading" loading onPress={() => {}} />
          </View>
        </View>

        <Separator />

        {/* Inputs */}
        <View style={styles.section}>
          <Typography variant="heading">Inputs</Typography>
          <Input label="Email Address" placeholder="hello@example.com" icon="mail" />
          <Input
            label="Password"
            placeholder="••••••••"
            icon="lock-closed"
            rightIcon="eye"
            secureTextEntry
          />
          <Input
            label="Error State"
            value="Invalid input"
            error="This field is required"
            icon="alert-circle"
          />
        </View>

        <Separator />

        {/* Cards & Badges */}
        <View style={styles.section}>
          <Typography variant="heading">Cards & Badges</Typography>
          <Card style={{ marginBottom: Spacing.m }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: Spacing.s,
              }}
            >
              <Typography variant="title">Exam Progress</Typography>
              <Badge label="In Progress" variant="warning" />
            </View>
            <Typography variant="body" color="muted">
              You have completed 12/50 questions.
            </Typography>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <Badge label="New" variant="secondary" />
              <Badge label="Pro" variant="outline" />
            </View>
          </Card>
        </View>

        <Separator />

        {/* Quiz Component */}
        <View style={styles.section}>
          <Typography variant="heading">Quiz Engine</Typography>
          <Card variant="outlined">
            <MultipleChoiceQuestion
              question="What is the correct way to sanitize a nail file?"
              options={[
                { id: '1', text: 'Wash with soap and water' },
                { id: '2', text: 'Soak in acetone for 10 minutes' },
                { id: '3', text: 'Disposables cannot be sanitized' },
                { id: '4', text: 'Spray with 70% alcohol' },
              ]}
              selectedOptionId={selectedOpt}
              onSelectOption={setSelectedOpt}
              correctOptionId={selectedOpt ? '3' : undefined}
              status={selectedOpt ? 'result' : 'answering'}
            />
          </Card>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </>
  );
}
