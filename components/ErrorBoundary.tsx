import React, { Component, ErrorInfo } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../constants/theme';

// ── Types ──────────────────────────────────────────────
interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

// ── Fallback UI (function component so we can use hooks) ─────────
function ErrorFallback({
    error,
    onReset,
}: {
    error: Error | null;
    onReset: () => void;
}) {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
    const [showDetails, setShowDetails] = React.useState(false);

    return (
        <SafeAreaView style={[styles.root, { backgroundColor: theme.background }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Icon */}
                <View style={[styles.iconCircle, { backgroundColor: theme.errorBg }]}>
                    <Text style={styles.iconEmoji}>⚠️</Text>
                </View>

                {/* Heading */}
                <Text style={[styles.title, { color: theme.text }]}>
                    Something went wrong
                </Text>

                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                    The app ran into an unexpected error.{'\n'}Please try again.
                </Text>

                {/* CTA */}
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.primary }]}
                    activeOpacity={0.8}
                    onPress={onReset}
                >
                    <Text style={[styles.buttonText, { color: theme.primaryForeground }]}>
                        Try Again
                    </Text>
                </TouchableOpacity>

                {/* Toggle details */}
                {error && (
                    <TouchableOpacity
                        style={styles.detailsToggle}
                        activeOpacity={0.6}
                        onPress={() => setShowDetails((v) => !v)}
                    >
                        <Text style={[styles.detailsToggleText, { color: theme.textMuted }]}>
                            {showDetails ? 'Hide details' : 'Show details'}
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Error details */}
                {error && showDetails && (
                    <View
                        style={[
                            styles.detailsCard,
                            { backgroundColor: theme.errorBg, borderColor: theme.error },
                        ]}
                    >
                        <Text
                            style={[styles.errorName, { color: theme.error }]}
                            numberOfLines={1}
                        >
                            {error.name}
                        </Text>
                        <Text
                            style={[styles.errorMessage, { color: theme.textSecondary }]}
                            numberOfLines={8}
                        >
                            {error.message}
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

// ── Error Boundary (class component) ───────────────────
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        // Log to console in dev; swap with Sentry/Crashlytics in production
        console.error(
            '[ErrorBoundary] Uncaught error:',
            error,
            info.componentStack,
        );
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <ErrorFallback error={this.state.error} onReset={this.handleReset} />
            );
        }
        return this.props.children;
    }
}

// ── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.xxxl,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    iconEmoji: {
        fontSize: 36,
    },
    title: {
        ...Typography.sizes.xl,
        fontWeight: Typography.weights.bold as any,
        textAlign: 'center',
        marginBottom: Spacing.s,
    },
    subtitle: {
        ...Typography.sizes.m,
        textAlign: 'center',
        marginBottom: Spacing.xl,
        paddingHorizontal: Spacing.l,
    },
    button: {
        paddingVertical: Spacing.m,
        paddingHorizontal: Spacing.xxl,
        borderRadius: Radius.full,
        alignItems: 'center',
        minWidth: 180,
    },
    buttonText: {
        ...Typography.sizes.m,
        fontWeight: Typography.weights.semibold as any,
    },
    detailsToggle: {
        marginTop: Spacing.l,
        paddingVertical: Spacing.s,
    },
    detailsToggleText: {
        ...Typography.sizes.s,
    },
    detailsCard: {
        width: '100%',
        borderWidth: 1,
        borderRadius: Radius.l,
        padding: Spacing.l,
        marginTop: Spacing.m,
    },
    errorName: {
        ...Typography.sizes.s,
        fontWeight: Typography.weights.semibold as any,
        marginBottom: Spacing.xs,
    },
    errorMessage: {
        ...Typography.sizes.xs,
        fontFamily: 'monospace',
    },
});
