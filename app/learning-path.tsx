import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { BookOpen, Brain, Building2, Factory, Lock, Truck } from 'lucide-react-native';
import React, { useEffect } from 'react';
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    Easing,
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');

// --- Configuration ---
const ROW_HEIGHT = 130;
const START_Y = 80;
const CENTER = width / 2;

// Path Geometry Config
const X_MARGIN = 30;
const CORNER_RADIUS = 65; // Adjusted to fit within ROW_HEIGHT
const X_MIN = X_MARGIN;
const X_MAX = width - X_MARGIN;

// Node Layout Config
// Each node has a "row" property to group nodes on the same horizontal line
// Pattern: Row 0 = 1 node, Row 1 = 2 nodes, Row 2 = 1 node, Row 3 = 2 nodes, Row 4 = 1 node
const LEVELS = [
    { id: 1, label: 'Core 1', layout: 0, row: 0, status: 'active' }, // Row 0: 1 node (center)
    { id: 2, label: 'Core 2', layout: -1, row: 1, status: 'locked' }, // Row 1: 2 nodes
    { id: 3, label: 'Core 3', layout: 1, row: 1, status: 'locked' }, // Row 1: 2 nodes
    { id: 4, label: 'Core 4', layout: 0, row: 2, status: 'locked' }, // Row 2: 1 node (center)
    { id: 5, label: 'Core 5', layout: -1, row: 3, status: 'locked' }, // Row 3: 2 nodes
    { id: 6, label: 'Core 6', layout: 1, row: 3, status: 'locked' }, // Row 3: 2 nodes
    { id: 7, label: 'Final', layout: 0, row: 4, status: 'locked' }, // Row 4: 1 node (center)
];

const TOTAL_ROWS = 5; // Rows 0-4

const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function LearningPathScreen() {
    const router = useRouter();
    const pathProgress = useSharedValue(0);

    useEffect(() => {
        pathProgress.value = withTiming(1, {
            duration: 3500,
            easing: Easing.inOut(Easing.ease),
        });
    }, []);

    // Calculate Node Positions based on ROW (not index)
    const nodePoints = LEVELS.map((level) => {
        const y = START_Y + level.row * ROW_HEIGHT;
        // 20% padding from edges means nodes at 20% and 80% of width
        // maxOffset = 30% of width (since CENTER is 50%, 50% - 30% = 20%)
        const maxOffset = width * 0.2;
        const x = CENTER + level.layout * maxOffset;
        return { x, y, ...level };
    });

    // Generate the "Snake" Path that ends at the final node
    const generateSnakePath = () => {
        const firstRowY = START_Y;
        const lastRowY = START_Y + (TOTAL_ROWS - 1) * ROW_HEIGHT;

        // Start at center of first row
        let d = `M ${CENTER} ${firstRowY}`;

        // Go RIGHT to edge
        d += ` L ${X_MAX - CORNER_RADIUS} ${firstRowY}`;
        d += ` Q ${X_MAX} ${firstRowY} ${X_MAX} ${firstRowY + CORNER_RADIUS}`;

        // Loop through rows 1 to TOTAL_ROWS-1
        for (let rowIndex = 1; rowIndex < TOTAL_ROWS; rowIndex++) {
            const currentY = START_Y + rowIndex * ROW_HEIGHT;
            const isGoingLeft = rowIndex % 2 !== 0;
            const isLastRow = rowIndex === TOTAL_ROWS - 1;

            if (isGoingLeft) {
                // Coming from RIGHT edge, going LEFT
                d += ` L ${X_MAX} ${currentY - CORNER_RADIUS}`;
                d += ` Q ${X_MAX} ${currentY} ${X_MAX - CORNER_RADIUS} ${currentY}`;

                if (isLastRow) {
                    // End at center for final node
                    d += ` L ${CENTER} ${currentY}`;
                } else {
                    // Continue to left edge
                    d += ` L ${X_MIN + CORNER_RADIUS} ${currentY}`;
                    d += ` Q ${X_MIN} ${currentY} ${X_MIN} ${currentY + CORNER_RADIUS}`;
                }
            } else {
                // Coming from LEFT edge, going RIGHT
                d += ` L ${X_MIN} ${currentY - CORNER_RADIUS}`;
                d += ` Q ${X_MIN} ${currentY} ${X_MIN + CORNER_RADIUS} ${currentY}`;

                if (isLastRow) {
                    // End at center for final node
                    d += ` L ${CENTER} ${currentY}`;
                } else {
                    // Continue to right edge
                    d += ` L ${X_MAX - CORNER_RADIUS} ${currentY}`;
                    d += ` Q ${X_MAX} ${currentY} ${X_MAX} ${currentY + CORNER_RADIUS}`;
                }
            }
        }

        return d;
    };

    const pathData = generateSnakePath();
    const lastRowY = START_Y + (TOTAL_ROWS - 1) * ROW_HEIGHT;
    const contentHeight = lastRowY + 150;

    const animatedPathProps = useAnimatedProps(() => ({
        strokeDashoffset: 2500 * (1 - pathProgress.value),
    }));

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>General Knowledge</Text>
                    <Text style={styles.headerSubtitle}>0% Completed</Text>
                </View>
                <View style={styles.headerRight}>
                    <View style={styles.pill}>
                        <BookOpen size={16} color={Colors.light.primary} />
                        <Text style={styles.pillText}>Theory</Text>
                    </View>
                    <Text style={styles.lessonCount}>0/23 Lessons</Text>
                </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
                <View style={styles.progressBarFill} />
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Decor Layer */}
                <View style={[styles.decorLayer, { height: contentHeight }]}>
                    <View style={[styles.decorItem, { top: 150, left: 20 }]}>
                        <Factory size={48} color={Colors.light.primaryLight} opacity={0.5} />
                    </View>
                    <View style={[styles.decorItem, { top: 300, right: 20 }]}>
                        <Truck size={48} color={Colors.light.primaryLight} opacity={0.5} />
                    </View>
                    <View style={[styles.decorItem, { top: 550, left: 30 }]}>
                        <Building2 size={48} color={Colors.light.primaryLight} opacity={0.5} />
                    </View>
                </View>

                <View style={[styles.contentContainer, { height: contentHeight }]}>
                    <Svg height={contentHeight} width={width} style={StyleSheet.absoluteFill}>
                        <Defs>
                            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                                <Stop offset="0" stopColor="#F880FA" stopOpacity="0.4" />
                                <Stop offset="1" stopColor="#F880FA" stopOpacity="0.1" />
                            </LinearGradient>
                        </Defs>

                        {/* Background thick path */}
                        <Path
                            d={pathData}
                            stroke="#FCCCFD"
                            strokeWidth="24"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {/* Foreground animating path */}
                        <AnimatedPath
                            d={pathData}
                            stroke="#F999FB"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={2500}
                            animatedProps={animatedPathProps}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </Svg>

                    {/* Nodes */}
                    {nodePoints.map((node, index) => (
                        <NodeItem key={node.id} node={node} index={index} total={nodePoints.length} />
                    ))}
                </View>
            </ScrollView>

            {/* Bottom Button */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Continue</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

// --- Individual Node Component ---
interface NodeProps {
    node: {
        x: number;
        y: number;
        id: number;
        label: string;
        layout: number;
        row: number;
        status: string;
    };
    index: number;
    total: number;
}

const NodeItem = ({ node, index }: NodeProps) => {
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        const delay = 300 + node.row * 600; // Delay based on row, not index
        scale.value = withDelay(delay, withSpring(1, { damping: 12, stiffness: 100 }));
        opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
    }, []);

    const rStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
            left: node.x - 40,
            top: node.y - 50,
        };
    });

    const isActive = node.status === 'active';

    return (
        <Animated.View style={[styles.nodeWrapper, rStyle]}>
            <View style={[styles.circle, isActive ? styles.activeCircle : styles.lockedCircle]}>
                {isActive && <View style={styles.activeRing} />}
                {isActive ? (
                    <Brain size={32} color="#FFF" />
                ) : (
                    <View style={styles.lockedContent}>
                        <Brain size={24} color="#aaa" />
                        <View style={styles.lockBadge}>
                            <Lock size={12} color="#FFF" />
                        </View>
                    </View>
                )}
            </View>
            <Text style={[styles.label, isActive ? styles.activeLabel : styles.lockedLabel]}>
                {node.label}
            </Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FEF2FF',
    },
    contentContainer: {
        flex: 1,
        position: 'relative',
        marginTop: 20,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.light.text,
    },
    headerSubtitle: {
        fontSize: 14,
        color: Colors.light.textMuted,
        marginTop: 4,
    },
    headerRight: {
        alignItems: 'flex-end',
    },
    pill: {
        flexDirection: 'row',
        backgroundColor: Colors.light.primaryLight,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 4,
    },
    pillText: {
        color: Colors.light.primary,
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 6,
    },
    lessonCount: {
        fontSize: 12,
        color: Colors.light.textMuted,
    },
    progressBarContainer: {
        height: 6,
        backgroundColor: Colors.light.input,
        marginHorizontal: 20,
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 10,
    },
    progressBarFill: {
        width: '5%',
        height: '100%',
        backgroundColor: Colors.light.primary,
        borderRadius: 3,
    },
    decorLayer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: -1,
    },
    decorItem: {
        position: 'absolute',
        opacity: 0.6,
    },
    nodeWrapper: {
        position: 'absolute',
        width: 80,
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    circle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#F880FA',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        backgroundColor: 'white',
        borderWidth: 4,
        borderColor: '#FFF',
    },
    activeCircle: {
        backgroundColor: '#F880FA',
        borderColor: '#F999FB',
    },
    activeRing: {
        position: 'absolute',
        width: 94,
        height: 94,
        borderRadius: 47,
        borderWidth: 2,
        borderColor: '#F880FA',
        opacity: 0.3,
    },
    lockedCircle: {
        backgroundColor: '#F8F8F8',
        borderColor: '#FFF',
        shadowOpacity: 0.05,
    },
    lockedContent: {
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.6,
    },
    lockBadge: {
        position: 'absolute',
        top: -5,
        right: -10,
        backgroundColor: '#D1D1D1',
        borderRadius: 10,
        padding: 4,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    label: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    activeLabel: {
        color: '#333',
    },
    lockedLabel: {
        color: '#999',
    },
    footer: {
        padding: 20,
        paddingBottom: 30,
        backgroundColor: 'transparent',
    },
    button: {
        backgroundColor: '#F880FA',
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: '#F880FA',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: '800',
    },
});
