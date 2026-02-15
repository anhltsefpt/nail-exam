import { BugReportModal } from '@/components/BugReportModal';
import { CongratsModal } from '@/components/CongratsModal';
import { FeedbackModal } from '@/components/FeedbackModal';
import { Typography } from '@/components/ui/Typography';
import { Colors, Radius, Spacing } from '@/constants/theme';

import { useRevenueCat } from '@/hooks/useRevenueCat';
import { track } from '@/lib/analytics';
import { useUserStore } from '@/store/useUserStore';
import DateTimePicker from '@react-native-community/datetimepicker';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import {
    AlertCircle,
    ArrowRight,
    Bell,
    Bug,
    Calendar,
    ChevronRight,
    Clock,
    Crown,
    FileText,
    Gem,
    Globe,
    Headset,
    MapPin,
    MessageSquare,
    Play,
    RotateCcw,
    ShieldCheck,
    Users,
    X
} from 'lucide-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    useColorScheme,
    View
} from 'react-native';

export default function MenuScreen() {
    const router = useRouter();
    const { t, i18n } = useTranslation();

    const { isPro, presentPaywall, presentCustomerCenter } = useRevenueCat();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const [congratsVisible, setCongratsVisible] = useState(false);

    const handlePresentPaywall = async () => {
        track('tap_upgrade', { source: 'banner' });
        const success = await presentPaywall();
        if (success) {
            setCongratsVisible(true);
        }
    };

    // Store state
    const gems = useUserStore((state) => state.gems);
    const streak = useUserStore((state) => state.streak);
    const language = useUserStore((state) => state.language);
    const reminderTime = useUserStore((state) => state.reminderTime);
    const notificationsEnabled = useUserStore((state) => state.notificationsEnabled); // from store

    // Actions
    const setLanguage = useUserStore((state) => state.setLanguage);
    const setReminderTime = useUserStore((state) => state.setReminderTime);
    const _setNotificationsEnabled = useUserStore.setState; // Direct access or add action? 
    // Actually we should add an action for toggling notifications to be clean, but for now we can use setState 
    // or just assume we need to update the store value manually.
    // Let's use the property from store directly. Wait, 'notificationsEnabled' is in store but we don't have a specific setter action exposed in interface?
    // UserState interface has `notificationsEnabled` boolean but no `setNotificationsEnabled` action. 
    // I should probably add it or just use `useUserStore.setState({ notificationsEnabled: val })`.
    // I will use `useUserStore.setState` for now as it's cleaner than modifying store again.

    const resetProgress = useUserStore((state) => state.resetProgress);

    // Local state for UI
    const [languageModalVisible, setLanguageModalVisible] = useState(false);
    const [resetModalVisible, setResetModalVisible] = useState(false);
    const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
    const [bugReportModalVisible, setBugReportModalVisible] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const appVersion = Constants.expoConfig?.version ?? '1.0.0';

    const LANGUAGES = [
        { code: 'en', label: 'English', flag: '🇬🇧' },
        { code: 'ko', label: 'Korean', flag: '🇰🇷' },
        { code: 'vi', label: 'Vietnamese', flag: '🇻🇳' },
    ];

    const getFlag = (langCode: string) => {
        return LANGUAGES.find(l => l.code === langCode)?.flag || '🇬🇧';
    };

    const handleLanguageChange = (langCode: string) => {
        track('change_language', { language: langCode });
        setLanguage(langCode as any);
        i18n.changeLanguage(langCode);
        setLanguageModalVisible(false);
    };

    const scheduleDailyNotification = async (time: string) => {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();

            const [hours, minutes] = time.split(':').map(Number);

            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Time to study! 💅",
                    body: "Keep up your streak and master your nail exam!",
                    sound: true,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DAILY,
                    hour: hours,
                    minute: minutes,
                },
            });
        } catch (error) {
            console.error("Error scheduling notification:", error);
        }
    };

    const toggleNotifications = async (value: boolean) => {
        track('toggle_notifications', { enabled: value });
        if (value) {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status === 'granted') {
                useUserStore.setState({ notificationsEnabled: true });
                scheduleDailyNotification(reminderTime);
            } else {
                Alert.alert(t('common.error'), "Permission denied. Please enable notifications in settings.");
                useUserStore.setState({ notificationsEnabled: false });
            }
        } else {
            useUserStore.setState({ notificationsEnabled: false });
            await Notifications.cancelAllScheduledNotificationsAsync();
        }
    };

    const onTimeChange = (event: any, selectedDate?: Date) => {
        setShowTimePicker(Platform.OS === 'ios'); // Keep open on iOS until manually closed if desired, or close.
        // Actually for iOS usually we keep it in a modal. For Android it closes auto.
        if (Platform.OS === 'android') setShowTimePicker(false);

        if (selectedDate) {
            const hours = selectedDate.getHours().toString().padStart(2, '0');
            const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
            const newTime = `${hours}:${minutes}`;

            setReminderTime(newTime);
            if (notificationsEnabled) {
                scheduleDailyNotification(newTime);
            }
        }
    };

    const confirmResetProgress = () => {
        track('tap_reset_progress');
        setResetModalVisible(true);
    };

    const handleResetProgress = () => {
        track('confirm_reset_progress');
        resetProgress();
        setResetModalVisible(false);
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundSubtle,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: Spacing.l,
            paddingVertical: Spacing.m,
            backgroundColor: theme.backgroundSubtle,
        },
        headerTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.text,
        },
        gemBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#FFFBEB', // Amber-50
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: Radius.full,
            borderWidth: 1,
            borderColor: '#FEF3C7',
        },
        content: {
            padding: Spacing.l,
            paddingBottom: 40,
        },
        premiumBanner: {
            borderRadius: Radius.l,
            overflow: 'hidden',
            marginBottom: Spacing.l,
        },
        premiumGradient: {
            padding: Spacing.l,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        sectionTitle: {
            marginTop: Spacing.l,
            marginBottom: Spacing.s,
            marginLeft: Spacing.xs,
            color: theme.textMuted,
        },
        menuGroup: {
            backgroundColor: theme.card,
            borderRadius: Radius.l,
            overflow: 'hidden',
            marginBottom: Spacing.m,
        },
        menuItem: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: Spacing.l,
            paddingHorizontal: Spacing.l,
            backgroundColor: theme.card,
        },
        menuItemBorder: {
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
        },
        menuItemLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        iconBox: {
            width: 32,
            height: 32,
            borderRadius: Radius.m,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: Spacing.m,
        },
        menuText: {
            fontSize: 16,
            color: theme.text,
            fontWeight: '500',
        },
        valueText: {
            fontSize: 14,
            color: theme.textMuted,
            marginRight: Spacing.s,
        },
        badge: {
            backgroundColor: theme.primary,
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 4,
            marginLeft: 8,
        },
        badgeText: {
            color: 'white',
            fontSize: 10,
            fontWeight: 'bold',
        },
        proBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#000',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: Radius.full,
            marginRight: Spacing.s,
        },
        progressCard: {
            backgroundColor: theme.card,
            borderRadius: Radius.l,
            padding: Spacing.l,
            marginBottom: Spacing.l,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        progressInfo: {
            flex: 1,
        },
        lockedOverlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(255,255,255,0.6)',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: Radius.l,
            zIndex: 10,
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center', // Changed to center for general modals
            alignItems: 'center',    // added alignment
        },
        modalContent: {
            backgroundColor: theme.background,
            borderRadius: Radius.l,
            padding: Spacing.xl,
            width: '85%',
            alignItems: 'center',
        },
        languageModalContent: {
            backgroundColor: theme.background,
            borderTopLeftRadius: Radius.xl,
            borderTopRightRadius: Radius.xl,
            padding: Spacing.l,
            paddingBottom: Spacing.xxxl,
            width: '100%',
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: Spacing.l,
        },
        languageOption: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: Spacing.l,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
        },
        disabledItem: {
            opacity: 0.5,
        },
        resetIconContainer: {
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: '#FEF2F2', // Red-50
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: Spacing.l,
        },
        modalButtons: {
            flexDirection: 'row',
            gap: Spacing.m,
            marginTop: Spacing.xl,
            width: '100%',
        },
        modalButton: {
            flex: 1,
            paddingVertical: Spacing.m,
            borderRadius: Radius.l,
            alignItems: 'center',
            justifyContent: 'center',
        },
        cancelButton: {
            backgroundColor: theme.input,
        },
        resetButton: {
            backgroundColor: '#EF4444',
        }
    });

    const MenuItem = ({
        icon: Icon,
        label,
        value,
        onPress,
        isLast,
        badge,
        rightElement,
        disabled
    }: any) => (
        <TouchableOpacity
            style={[styles.menuItem, !isLast && styles.menuItemBorder, disabled && styles.disabledItem]}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={disabled}
        >
            <View style={styles.menuItemLeft}>
                <Icon size={22} color={theme.text} strokeWidth={1.5} />
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.menuText, { marginLeft: 12 }]}>{label}</Text>
                    {badge && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{badge}</Text>
                        </View>
                    )}
                </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {value && <Text style={styles.valueText}>{value}</Text>}
                {rightElement ? rightElement : <ChevronRight size={20} color={theme.textMuted} />}
            </View>
        </TouchableOpacity>
    );

    // Parse reminderTime to Date object for picker
    const [hours, minutes] = reminderTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours || 9);
    date.setMinutes(minutes || 0);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
                    <ArrowRight size={24} color={theme.text} style={{ transform: [{ rotate: '180deg' }] }} />
                </TouchableOpacity>
                <Typography variant="heading" style={{ fontSize: 18 }} tx="menu.title">Menu</Typography>
                <View style={styles.gemBadge}>
                    <Typography variant="caption" weight="bold" style={{ marginRight: 4, color: '#D97706' }}>{gems}</Typography>
                    <Gem size={12} color="#D97706" fill="#FCD34D" />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Premium Banner */}
                {!isPro && (
                    <TouchableOpacity style={styles.premiumBanner} onPress={handlePresentPaywall}>
                        <LinearGradient
                            colors={['#FF9A9E', '#FECFEF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.premiumGradient}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{
                                    width: 40, height: 40, borderRadius: 20,
                                    backgroundColor: 'rgba(255,255,255,0.3)',
                                    alignItems: 'center', justifyContent: 'center',
                                    marginRight: 12
                                }}>
                                    <Crown size={24} color="white" fill="white" />
                                </View>
                                <Typography variant="body" weight="bold" color="inverted" style={{ fontSize: 16 }} tx="menu.premiumBanner.title">
                                    Upgrade to the Premium
                                </Typography>
                            </View>
                            <Play size={24} color="white" fill="white" />
                        </LinearGradient>
                    </TouchableOpacity>
                )}

                {/* Progress Section (Premium) */}
                <View style={styles.progressCard}>
                    {!isPro && (
                        <View style={styles.lockedOverlay}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#000', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
                                <Crown size={14} color="#FCD34D" fill="#FCD34D" style={{ marginRight: 6 }} />
                                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>{t('menu.progress.locked')}</Text>
                            </View>
                        </View>
                    )}

                    <View style={styles.progressInfo}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                            <View>
                                <Text style={{ color: theme.textMuted, fontSize: 12, marginBottom: 4 }}>{t('menu.progress.questionsAnswered')}</Text>
                                <Text style={{ color: theme.text, fontSize: 20, fontWeight: 'bold' }}>0</Text>
                            </View>
                            <View>
                                <Text style={{ color: theme.textMuted, fontSize: 12, marginBottom: 4 }}>{t('menu.progress.accuracy')}</Text>
                                <Text style={{ color: theme.success, fontSize: 20, fontWeight: 'bold' }}>0%</Text>
                            </View>
                            <View>
                                <Text style={{ color: theme.textMuted, fontSize: 12, marginBottom: 4 }}>{t('menu.progress.studyTime')}</Text>
                                <Text style={{ color: theme.text, fontSize: 20, fontWeight: 'bold' }}>0h</Text>
                            </View>
                        </View>

                        <View style={{ width: '100%', height: 6, backgroundColor: theme.input, borderRadius: 3 }}>
                            <View style={{ width: '0%', height: '100%', backgroundColor: theme.primary, borderRadius: 3 }} />
                        </View>
                        <Text style={{ color: theme.textMuted, fontSize: 10, marginTop: 6, textAlign: 'center' }}>
                            {t('menu.progress.keepPracticing')}
                        </Text>
                    </View>
                </View>

                {/* Menu Group 1 */}
                <View style={styles.menuGroup}>
                    <MenuItem
                        icon={Users}
                        label={t('menu.items.referFriends')}
                        onPress={() => { }}
                        badge="NEW"
                    />
                    <MenuItem
                        icon={Crown}
                        label={t('menu.items.achievements')}
                        onPress={() => { }}
                    />
                    {isPro && (
                        <MenuItem
                            icon={Headset}
                            label="Manage Subscription"
                            onPress={() => { track('tap_manage_subscription'); presentCustomerCenter(); }}
                            isLast
                        />
                    )}
                    {!isPro && (
                        <MenuItem
                            icon={Crown}
                            label="Upgrade to Pro"
                            onPress={() => { track('tap_upgrade', { source: 'menu_item' }); handlePresentPaywall(); }}
                            isLast
                        />
                    )}
                </View>

                {/* Settings Exam */}
                <Typography variant="caption" style={styles.sectionTitle} tx="menu.items.settingsExam">Settings Exam</Typography>
                <View style={styles.menuGroup}>
                    <MenuItem
                        icon={Globe}
                        label={t('common.selectLanguage')}
                        onPress={() => setLanguageModalVisible(true)}
                        value={language.toUpperCase()}
                        rightElement={
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ fontSize: 16, marginRight: 8 }}>{getFlag(language)}</Text>
                                <View style={{ backgroundColor: theme.input, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 8 }}>
                                    <Text style={{ color: theme.textMuted, fontSize: 12 }}>{language.toUpperCase()}</Text>
                                </View>
                            </View>
                        }
                    />
                    <MenuItem
                        icon={MapPin}
                        label={t('menu.items.changeState')}
                        onPress={() => { }}
                    />
                    <MenuItem
                        icon={FileText}
                        label={t('menu.items.changeEndorsements')}
                        onPress={() => { }}
                    />
                    <MenuItem
                        icon={Calendar}
                        label={t('menu.items.examDate')}
                        onPress={() => { }}
                        isLast
                    />
                </View>

                {/* General Settings */}
                <Typography variant="caption" style={styles.sectionTitle} tx="menu.items.generalSettings">General Settings</Typography>
                <View style={styles.menuGroup}>
                    <MenuItem
                        icon={Bell}
                        label={t('menu.items.notification')}
                        onPress={() => toggleNotifications(!notificationsEnabled)}
                        rightElement={
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={toggleNotifications}
                                trackColor={{ false: theme.input, true: theme.primary }}
                                thumbColor={'white'}
                                ios_backgroundColor={theme.input}
                            />
                        }
                    />
                    <MenuItem
                        icon={Clock}
                        label={t('menu.items.remindMeAt')}
                        onPress={() => setShowTimePicker(true)}
                        value={reminderTime}
                        disabled={!notificationsEnabled}
                        isLast={false}
                    />

                    <MenuItem
                        icon={RotateCcw}
                        label={t('menu.items.resetProgress')}
                        onPress={confirmResetProgress}
                    />
                </View>

                {/* App Information */}
                <Typography variant="caption" style={styles.sectionTitle} tx="menu.items.appInformation">App Information</Typography>
                <View style={styles.menuGroup}>
                    <MenuItem
                        icon={FileText}
                        label={t('menu.items.termsOfUse')}
                        onPress={() => { }}
                    />
                    <MenuItem
                        icon={ShieldCheck}
                        label={t('menu.items.privacyPolicy')}
                        onPress={() => { }}
                    />
                    <MenuItem
                        icon={AlertCircle}
                        label={t('menu.items.appVersion')}
                        value={appVersion}
                        onPress={() => { }}
                        rightElement={<View />} // Empty view to remove chevron
                    />
                    <MenuItem
                        icon={MessageSquare}
                        label={t('menu.items.faqs')}
                        onPress={() => { }}
                        isLast
                    />
                </View>

                {/* Feedback And Sharing */}
                <Typography variant="caption" style={styles.sectionTitle} tx="menu.items.feedbackAndSharing">Feedback And Sharing</Typography>
                <View style={styles.menuGroup}>
                    <MenuItem
                        icon={MessageSquare}
                        label={t('menu.items.contactUs')}
                        onPress={() => { }}
                    />
                    <MenuItem
                        icon={MessageSquare}
                        label={t('menu.items.interfaceEvaluation')}
                        onPress={() => { track('tap_feedback'); setFeedbackModalVisible(true); }}
                    />
                    <MenuItem
                        icon={Bug}
                        label={t('menu.items.reportBug')}
                        onPress={() => { track('tap_bug_report'); setBugReportModalVisible(true); }}
                        isLast
                    />
                </View>

            </ScrollView>

            {/* Language Picker Modal */}
            <Modal
                visible={languageModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setLanguageModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setLanguageModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.languageModalContent}>
                                <View style={styles.modalHeader}>
                                    <Typography variant="heading" style={{ fontSize: 18 }} tx="common.selectLanguage">Select Language</Typography>
                                    <TouchableOpacity onPress={() => setLanguageModalVisible(false)}>
                                        <X size={24} color={theme.text} />
                                    </TouchableOpacity>
                                </View>
                                {LANGUAGES.map((lang) => (
                                    <TouchableOpacity
                                        key={lang.code}
                                        style={styles.languageOption}
                                        onPress={() => handleLanguageChange(lang.code)}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Text style={{ fontSize: 24, marginRight: 12 }}>{lang.flag}</Text>
                                            <Typography variant="body" style={{ fontSize: 16 }}>{lang.label}</Typography>
                                        </View>
                                        {language === lang.code && (
                                            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.primary }} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Custom Reset Progress Modal */}
            <Modal
                visible={resetModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setResetModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.resetIconContainer}>
                            <AlertCircle size={32} color="#EF4444" fill="#FEE2E2" />
                        </View>

                        <Typography variant="heading" style={{ fontSize: 20, marginBottom: 8, textAlign: 'center' }}>
                            {t('menu.items.resetProgress')}?
                        </Typography>

                        <Typography variant="body" color="muted" style={{ textAlign: 'center', lineHeight: 22 }} tx="menu.resetConfirmMessage" />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setResetModalVisible(false)}
                            >
                                <Typography variant="body" weight="medium" tx="common.cancel" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.resetButton]}
                                onPress={handleResetProgress}
                            >
                                <Typography variant="body" weight="bold" color="inverted" tx="common.reset" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Time Picker Modal for iOS/Android */}
            {showTimePicker && (
                Platform.OS === 'ios' ? (
                    <Modal
                        transparent
                        animationType="fade"
                        visible={showTimePicker}
                        onRequestClose={() => setShowTimePicker(false)}
                    >
                        <TouchableWithoutFeedback onPress={() => setShowTimePicker(false)}>
                            <View style={styles.modalOverlay}>
                                <TouchableWithoutFeedback>
                                    <View style={styles.modalContent}>
                                        <View style={styles.modalHeader}>
                                            <Typography variant="heading">Select Reminder Time</Typography>
                                            <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                                                <Text style={{ color: theme.primary, fontWeight: 'bold' }}>Done</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={{ alignItems: 'center', paddingBottom: 20 }}>
                                            <DateTimePicker
                                                value={date}
                                                mode="time"
                                                display="spinner"
                                                onChange={onTimeChange}
                                                textColor={theme.text}
                                            />
                                        </View>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>
                ) : (
                    <DateTimePicker
                        value={date}
                        mode="time"
                        is24Hour={true}
                        display="default"
                        onChange={onTimeChange}
                    />
                )
            )}

            <FeedbackModal
                visible={feedbackModalVisible}
                onClose={() => setFeedbackModalVisible(false)}
            />

            <BugReportModal
                visible={bugReportModalVisible}
                onClose={() => setBugReportModalVisible(false)}
            />

            <CongratsModal
                visible={congratsVisible}
                onClose={() => setCongratsVisible(false)}
            />
        </SafeAreaView>
    );
}
