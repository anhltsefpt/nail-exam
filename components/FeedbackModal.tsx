import { Colors, Radius, Spacing } from '@/constants/theme';
import { feedbackRepository } from '@/services/repositories/FeedbackRepository';
import { useUserStore } from '@/store/useUserStore';
import * as StoreReview from 'expo-store-review';
import { Star, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    Linking,
    Modal,
    Platform,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    useColorScheme,
    View
} from 'react-native';
import { Typography } from './ui/Typography';

interface FeedbackModalProps {
    visible: boolean;
    onClose: () => void;
}

const STORE_URL_IOS = "https://apps.apple.com/app/id6742767077?action=write-review"; // Placeholder ID
const STORE_URL_ANDROID = "market://details?id=com.nailexam.app"; // Placeholder Package

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ visible, onClose }) => {
    const { t } = useTranslation();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const feedbackRating = useUserStore((state) => state.feedbackRating);
    const setFeedbackRatingStore = useUserStore((state) => state.setFeedbackRating);

    // If existing rating is >= 4, we consider it "locked" and "completed"
    const isLocked = feedbackRating !== null && feedbackRating >= 4;

    const [rating, setRating] = useState(feedbackRating || 0);

    const handleRate = (selectedRating: number) => {
        if (isLocked) return;
        setRating(selectedRating);
    };

    const handleSave = async () => {
        if (rating === 0) return;

        // Save to store
        setFeedbackRatingStore(rating);

        // Save to repository
        await feedbackRepository.saveFeedback({
            id: Date.now().toString(),
            rating: rating,
            timestamp: Date.now(),
        });

        // Close modal or show further prompts
        if (rating >= 4) {
            // Good rating: Ask to rate on store
            // Use StoreReview for in-app prompt if available and appropriate
            if (await StoreReview.hasAction()) {
                await StoreReview.requestReview();
                onClose();
            } else {
                Alert.alert(
                    t('menu.feedback.thankYou'),
                    t('menu.feedback.storePrompt'),
                    [
                        { text: t('menu.feedback.notNow'), style: 'cancel', onPress: onClose },
                        {
                            text: t('menu.feedback.rateOnStore'),
                            onPress: () => {
                                const url = Platform.OS === 'ios' ? STORE_URL_IOS : STORE_URL_ANDROID;
                                Linking.openURL(url).catch(() => {
                                    Alert.alert(t('common.error'), "Could not open store.");
                                });
                                onClose();
                            }
                        }
                    ]
                );
            }
        } else {
            // Low rating - just say thanks
            Alert.alert(t('menu.feedback.thankYou'), "", [{ text: "OK", onPress: onClose }]);
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
            paddingBottom: Spacing.xxxl, // specific for bottom sheet feel
            alignItems: 'center',
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
            marginBottom: Spacing.l,
        },
        starsContainer: {
            flexDirection: 'row',
            gap: Spacing.m, // native gap
            marginBottom: Spacing.xl,
            opacity: isLocked ? 0.7 : 1,
        },
        starButton: {
            padding: Spacing.s,
        },
        saveButton: {
            backgroundColor: theme.primary,
            paddingVertical: Spacing.m,
            paddingHorizontal: Spacing.xl,
            borderRadius: Radius.l,
            width: '100%',
            alignItems: 'center',
            opacity: (rating === 0 || isLocked) ? 0.5 : 1,
        }
    });

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.sheet}>
                            <View style={styles.header}>
                                <View style={{ width: 24 }} />
                                <Typography variant="heading" style={{ fontSize: 18, textAlign: 'center' }} tx="menu.feedback.title">
                                    Enjoying the app?
                                </Typography>
                                <TouchableOpacity onPress={onClose}>
                                    <X size={24} color={theme.text} />
                                </TouchableOpacity>
                            </View>

                            <Typography
                                variant="body"
                                color="muted"
                                style={{ marginBottom: Spacing.xl, textAlign: 'center' }}
                                tx={isLocked ? "menu.feedback.alreadyRated" : "menu.feedback.subtitle"}
                            />

                            <View style={styles.starsContainer}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity
                                        key={star}
                                        style={styles.starButton}
                                        onPress={() => handleRate(star)}
                                        disabled={isLocked}
                                    >
                                        <Star
                                            size={40}
                                            color={star <= rating ? "#FCD34D" : theme.border} // Gold or Gray
                                            fill={star <= rating ? "#FCD34D" : "transparent"}
                                            strokeWidth={star <= rating ? 0 : 1}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {!isLocked && (
                                <TouchableOpacity
                                    style={styles.saveButton}
                                    onPress={handleSave}
                                    disabled={rating === 0}
                                >
                                    <Typography variant="body" weight="bold" color="inverted" tx="menu.feedback.submit">
                                        Submit
                                    </Typography>
                                </TouchableOpacity>
                            )}

                            {isLocked && (
                                <Typography variant="body" color="success" weight="bold" tx="menu.feedback.thankYou" />
                            )}
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};
