import { Typography } from '@/components/ui/Typography';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useRevenueCat } from '@/hooks/useRevenueCat';
import { useUserStore } from '@/store/useUserStore';
import { LinearGradient } from 'expo-linear-gradient';
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
    MapPin,
    MessageSquare,
    Play,
    RotateCcw,
    ShieldCheck,
    Users,
    X
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Modal,
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
    const { user, signOut } = useAuth();
    const { isPro } = useRevenueCat();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    // Store state
    const gems = useUserStore((state) => state.gems);
    const streak = useUserStore((state) => state.streak);

    // Local state for toggles
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [languageModalVisible, setLanguageModalVisible] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState({ code: 'EN', label: 'English', flag: '🇬🇧' });

    const LANGUAGES = [
        { code: 'EN', label: 'English', flag: '🇬🇧' },
        { code: 'KO', label: 'Korean', flag: '🇰🇷' },
        { code: 'VI', label: 'Vietnamese', flag: '🇻🇳' },
    ];

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
            justifyContent: 'flex-end',
        },
        modalContent: {
            backgroundColor: theme.background,
            borderTopLeftRadius: Radius.xl,
            borderTopRightRadius: Radius.xl,
            padding: Spacing.l,
            paddingBottom: Spacing.xxxl,
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
    });

    const MenuItem = ({
        icon: Icon,
        label,
        value,
        onPress,
        isLast,
        badge,
        rightElement
    }: any) => (
        <TouchableOpacity
            style={[styles.menuItem, !isLast && styles.menuItemBorder]}
            onPress={onPress}
            activeOpacity={0.7}
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

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
                    <ArrowRight size={24} color={theme.text} style={{ transform: [{ rotate: '180deg' }] }} />
                </TouchableOpacity>
                <Typography variant="heading" style={{ fontSize: 18 }}>Menu</Typography>
                <View style={styles.gemBadge}>
                    <Typography variant="caption" weight="bold" style={{ marginRight: 4, color: '#D97706' }}>{gems}</Typography>
                    <Gem size={12} color="#D97706" fill="#FCD34D" />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Premium Banner */}
                {!isPro && (
                    <TouchableOpacity style={styles.premiumBanner} onPress={() => router.push('/paywall')}>
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
                                <Typography variant="body" weight="bold" color="inverted" style={{ fontSize: 16 }}>
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
                                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>Get Pro to Unlock</Text>
                            </View>
                        </View>
                    )}

                    <View style={styles.progressInfo}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                            <View>
                                <Text style={{ color: theme.textMuted, fontSize: 12, marginBottom: 4 }}>Questions Answered</Text>
                                <Text style={{ color: theme.text, fontSize: 20, fontWeight: 'bold' }}>0</Text>
                            </View>
                            <View>
                                <Text style={{ color: theme.textMuted, fontSize: 12, marginBottom: 4 }}>Accuracy</Text>
                                <Text style={{ color: theme.success, fontSize: 20, fontWeight: 'bold' }}>0%</Text>
                            </View>
                            <View>
                                <Text style={{ color: theme.textMuted, fontSize: 12, marginBottom: 4 }}>Study Time</Text>
                                <Text style={{ color: theme.text, fontSize: 20, fontWeight: 'bold' }}>0h</Text>
                            </View>
                        </View>

                        <View style={{ width: '100%', height: 6, backgroundColor: theme.input, borderRadius: 3 }}>
                            <View style={{ width: '0%', height: '100%', backgroundColor: theme.primary, borderRadius: 3 }} />
                        </View>
                        <Text style={{ color: theme.textMuted, fontSize: 10, marginTop: 6, textAlign: 'center' }}>
                            Keep practicing to unlock more insights!
                        </Text>
                    </View>
                </View>

                {/* Menu Group 1 */}
                <View style={styles.menuGroup}>
                    <MenuItem
                        icon={Users}
                        label="Refer Friends"
                        onPress={() => { }}
                        badge="NEW"
                    />
                    <MenuItem
                        icon={Crown}
                        label="Achievements"
                        onPress={() => { }}
                        isLast
                    />
                </View>

                {/* Settings Exam */}
                <Typography variant="caption" style={styles.sectionTitle}>Settings Exam</Typography>
                <View style={styles.menuGroup}>
                    <MenuItem
                        icon={Globe}
                        label="Select Language"
                        onPress={() => setLanguageModalVisible(true)}
                        value={selectedLanguage.code}
                        rightElement={
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ fontSize: 16, marginRight: 8 }}>{selectedLanguage.flag}</Text>
                                <View style={{ backgroundColor: theme.input, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 8 }}>
                                    <Text style={{ color: theme.textMuted, fontSize: 12 }}>{selectedLanguage.code}</Text>
                                </View>
                            </View>
                        }
                    />
                    <MenuItem
                        icon={MapPin}
                        label="Change state"
                        onPress={() => { }}
                    />
                    <MenuItem
                        icon={FileText}
                        label="Change Endorsements"
                        onPress={() => { }}
                    />
                    <MenuItem
                        icon={Calendar}
                        label="Exam Date"
                        onPress={() => { }}
                        isLast
                    />
                </View>

                {/* General Settings */}
                <Typography variant="caption" style={styles.sectionTitle}>General Settings</Typography>
                <View style={styles.menuGroup}>
                    <MenuItem
                        icon={Bell}
                        label="Notification"
                        onPress={() => setNotificationsEnabled(!notificationsEnabled)}
                        rightElement={
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={setNotificationsEnabled}
                                trackColor={{ false: theme.input, true: theme.primary }}
                                thumbColor={'white'}
                                ios_backgroundColor={theme.input}
                            />
                        }
                    />
                    <MenuItem
                        icon={Clock}
                        label="Remind Me At"
                        onPress={() => { }}
                        value="00:00"
                        isLast={false}
                    />

                    <MenuItem
                        icon={RotateCcw}
                        label="Reset Progress"
                        onPress={() => { }}
                    />
                </View>

                {/* App Information */}
                <Typography variant="caption" style={styles.sectionTitle}>App Information</Typography>
                <View style={styles.menuGroup}>
                    <MenuItem
                        icon={FileText}
                        label="Terms Of Use"
                        onPress={() => { }}
                    />
                    <MenuItem
                        icon={ShieldCheck}
                        label="Privacy Policy"
                        onPress={() => { }}
                    />
                    <MenuItem
                        icon={AlertCircle}
                        label="App Version"
                        value="4.4.8(10)"
                        onPress={() => { }}
                        rightElement={<View />} // Empty view to remove chevron
                    />
                    <MenuItem
                        icon={MessageSquare}
                        label="FAQs"
                        onPress={() => { }}
                        isLast
                    />
                </View>

                {/* Feedback And Sharing */}
                <Typography variant="caption" style={styles.sectionTitle}>Feedback And Sharing</Typography>
                <View style={styles.menuGroup}>
                    <MenuItem
                        icon={MessageSquare}
                        label="Contact Us"
                        onPress={() => { }}
                    />
                    <MenuItem
                        icon={MessageSquare}
                        label="Interface Evaluation"
                        onPress={() => { }}
                    />
                    <MenuItem
                        icon={Bug}
                        label="Report Bug"
                        onPress={() => { }}
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
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Typography variant="heading" style={{ fontSize: 18 }}>Select Language</Typography>
                                    <TouchableOpacity onPress={() => setLanguageModalVisible(false)}>
                                        <X size={24} color={theme.text} />
                                    </TouchableOpacity>
                                </View>
                                {LANGUAGES.map((lang) => (
                                    <TouchableOpacity
                                        key={lang.code}
                                        style={styles.languageOption}
                                        onPress={() => {
                                            setSelectedLanguage(lang);
                                            setLanguageModalVisible(false);
                                        }}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Text style={{ fontSize: 24, marginRight: 12 }}>{lang.flag}</Text>
                                            <Typography variant="body" style={{ fontSize: 16 }}>{lang.label}</Typography>
                                        </View>
                                        {selectedLanguage.code === lang.code && (
                                            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.primary }} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </SafeAreaView>
    );
}
