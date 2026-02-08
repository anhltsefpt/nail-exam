import { Colors, Radius, Spacing } from '@/constants/theme';
import { bugReportRepository } from '@/services/repositories/BugReportRepository';
import { X } from 'lucide-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    useColorScheme,
    View,
} from 'react-native';
import { Typography } from './ui/Typography';

interface BugReportModalProps {
    visible: boolean;
    onClose: () => void;
}

const CATEGORIES = [
    { id: 'quizIssue', labelTx: 'bugReport.categories.quizIssue' },
    { id: 'contentError', labelTx: 'bugReport.categories.contentError' },
    { id: 'uiIssue', labelTx: 'bugReport.categories.uiIssue' },
    { id: 'performance', labelTx: 'bugReport.categories.performance' },
    { id: 'other', labelTx: 'bugReport.categories.other' },
];

export const BugReportModal: React.FC<BugReportModalProps> = ({ visible, onClose }) => {
    const { t } = useTranslation();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleClose = () => {
        // Reset state
        setSelectedCategory(null);
        setDescription('');
        setIsSubmitting(false);
        onClose();
    };

    const handleSubmit = async () => {
        if (!selectedCategory || !description.trim()) {
            Alert.alert(t('common.error'), t('bugReport.validationError'));
            return;
        }

        setIsSubmitting(true);
        try {
            await bugReportRepository.saveBugReport({
                id: Date.now().toString(),
                category: selectedCategory,
                description: description.trim(),
                timestamp: Date.now(),
            });

            Alert.alert(t('common.success'), t('bugReport.successMessage'), [
                {
                    text: 'OK',
                    onPress: () => {
                        handleClose();
                    },
                },
            ]);
        } catch (error) {
            console.error('Failed to submit bug report:', error);
            Alert.alert(t('common.error'), "Could not submit report. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const styles = StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
        },
        sheet: {
            backgroundColor: theme.background,
            borderTopLeftRadius: Radius.xl,
            borderTopRightRadius: Radius.xl,
            padding: Spacing.xl,
            paddingBottom: Spacing.xxxl,
            maxHeight: '90%',
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: Spacing.l,
        },
        categoryContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: Spacing.s,
            marginBottom: Spacing.l,
        },
        categoryChip: {
            paddingVertical: Spacing.s,
            paddingHorizontal: Spacing.m,
            borderRadius: Radius.l,
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: theme.card,
        },
        categoryChipSelected: {
            backgroundColor: theme.primary,
            borderColor: theme.primary,
        },
        textInput: {
            backgroundColor: theme.card,
            borderRadius: Radius.m,
            padding: Spacing.m,
            borderWidth: 1,
            borderColor: theme.border,
            color: theme.text,
            height: 120,
            textAlignVertical: 'top',
            marginBottom: Spacing.xl,
        },
        submitButton: {
            backgroundColor: theme.primary,
            paddingVertical: Spacing.m,
            borderRadius: Radius.l,
            alignItems: 'center',
            opacity: isSubmitting ? 0.7 : 1,
        },
    });

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <TouchableWithoutFeedback onPress={handleClose}>
                    <View style={styles.overlay}>
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <View style={styles.sheet}>
                                <View style={styles.header}>
                                    <View style={{ width: 24 }} />
                                    <Typography variant="heading" style={{ fontSize: 18, textAlign: 'center' }} tx="bugReport.title">
                                        Report a Bug
                                    </Typography>
                                    <TouchableOpacity onPress={handleClose}>
                                        <X size={24} color={theme.text} />
                                    </TouchableOpacity>
                                </View>

                                <Typography variant="body" color="muted" style={{ marginBottom: Spacing.l }} tx="bugReport.subtitle">
                                    Found an issue? Let us know so we can fix it.
                                </Typography>

                                <ScrollView>
                                    <View style={styles.categoryContainer}>
                                        {CATEGORIES.map((cat) => {
                                            const isSelected = selectedCategory === cat.id;
                                            return (
                                                <TouchableOpacity
                                                    key={cat.id}
                                                    style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                                                    onPress={() => setSelectedCategory(cat.id)}
                                                >
                                                    <Typography
                                                        variant="caption"
                                                        color={isSelected ? 'inverted' : 'primary'}
                                                        tx={cat.labelTx}
                                                    />
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>

                                    <TextInput
                                        style={styles.textInput}
                                        placeholder={t('bugReport.describeIssue')}
                                        placeholderTextColor={theme.textMuted}
                                        multiline
                                        value={description}
                                        onChangeText={setDescription}
                                    />

                                    <TouchableOpacity
                                        style={styles.submitButton}
                                        onPress={handleSubmit}
                                        disabled={isSubmitting}
                                    >
                                        <Typography variant="body" weight="bold" color="inverted" tx="bugReport.submitReport">
                                            Submit Report
                                        </Typography>
                                    </TouchableOpacity>

                                    {/* Additional padding for bottom safe area if needed */}
                                    <View style={{ height: Spacing.xl }} />
                                </ScrollView>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </Modal>
    );
};
