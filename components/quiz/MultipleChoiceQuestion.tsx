import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Spacing } from '../../constants/theme';
import { Typography } from '../ui/Typography';
import { OptionCard, OptionStatus } from './OptionCard';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface MultipleChoiceQuestionProps {
  question: string;
  options: QuestionOption[];
  selectedOptionId?: string | null;
  correctOptionId?: string | null; // If provided, shows validation state
  onSelectOption: (id: string) => void;
  status?: 'answering' | 'result';
}

export function MultipleChoiceQuestion({
  question,
  options,
  selectedOptionId,
  correctOptionId,
  onSelectOption,
  status = 'answering',
}: MultipleChoiceQuestionProps) {
  const getOptionStatus = (optionId: string): OptionStatus => {
    if (status === 'answering') {
      return selectedOptionId === optionId ? 'selected' : 'idle';
    }

    // Result mode
    if (optionId === correctOptionId) {
      return 'correct';
    }
    if (optionId === selectedOptionId && selectedOptionId !== correctOptionId) {
      return 'incorrect';
    }
    return 'idle';
  };

  return (
    <View style={styles.container}>
      <Typography variant="heading" style={{ marginBottom: Spacing.l }}>
        {question}
      </Typography>

      <View>
        {options.map((option, index) => {
          const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
          const indexLabel = letters[index % letters.length];

          return (
            <OptionCard
              key={option.id}
              id={option.id}
              label={option.text}
              indexLabel={indexLabel}
              status={getOptionStatus(option.id)}
              selected={selectedOptionId === option.id}
              onPress={() => status === 'answering' && onSelectOption(option.id)}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
