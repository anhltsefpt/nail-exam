import { Colors } from '@/constants/theme';
import { RoadmapNodeConfig } from '@/data/roadmap-config';
import { useUserStore } from '@/store/useUserStore';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedProps,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { RoadmapNode } from './RoadmapNode';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedPath = Animated.createAnimatedComponent(Path);

interface CategorySectionProps {
    title: string;
    phaseIndex: 1 | 2 | 3 | 4;
    nodes: RoadmapNodeConfig[];
    rowPattern: number[];
    startFromLeft?: boolean;
    isLast?: boolean;
}

// ── Layout constants ──
const SECTION_PADDING = 16;
const CONTENT_WIDTH = SCREEN_WIDTH - SECTION_PADDING * 2;
const ROW_HEIGHT = 80;
const BANNER_HEIGHT = 46;
const START_Y = BANNER_HEIGHT + ROW_HEIGHT; // Banner sits inside the map, first row below it
const CENTER = CONTENT_WIDTH / 2;
const MAX_OFFSET = CONTENT_WIDTH * 0.22;
const CORNER_RADIUS = 40;
const X_MIN = 24;
const X_MAX = CONTENT_WIDTH - 24;

export function computeExitSide(
    rowPattern: number[],
    startFromLeft: boolean
): 'left' | 'right' {
    const lastRowIdx = rowPattern.length - 1;
    const lastSweepRight = startFromLeft
        ? lastRowIdx % 2 === 0
        : lastRowIdx % 2 !== 0;
    return lastSweepRight ? 'right' : 'left';
}

export function CategorySection({
    title,
    phaseIndex,
    nodes,
    rowPattern,
    startFromLeft = true,
    isLast = false,
}: CategorySectionProps) {
    const router = useRouter();
    const nodeStatus = useUserStore((s) => s.nodeStatus);
    const nodeProgress = useUserStore((s) => s.nodeProgress);
    const pathProgress = useSharedValue(0);

    const theme = Colors.light;
    const phase = theme.phase[phaseIndex];

    useEffect(() => {
        pathProgress.value = withTiming(1, {
            duration: 2500,
            easing: Easing.inOut(Easing.ease),
        });
    }, []);

    const numRows = rowPattern.length;
    const isSweepRight = (rowIdx: number) =>
        startFromLeft ? rowIdx % 2 === 0 : rowIdx % 2 !== 0;

    // ── Compute node positions ──
    const nodePoints: Array<{
        x: number; y: number; id: number; label: string;
        row: number; status: string; progress: number;
    }> = [];

    let nodeIdx = 0;
    for (let rowIdx = 0; rowIdx < numRows; rowIdx++) {
        const count = rowPattern[rowIdx];
        const y = START_Y + rowIdx * ROW_HEIGHT;
        const sweepRight = isSweepRight(rowIdx);

        const slots: number[] = [];
        for (let i = 0; i < count; i++) {
            if (count === 1) slots.push(0);
            else if (count === 2) slots.push(i === 0 ? -1 : 1);
            else slots.push(i - 1);
        }
        if (!sweepRight) slots.reverse();

        for (const slot of slots) {
            if (nodeIdx >= nodes.length) break;
            const n = nodes[nodeIdx];
            nodePoints.push({
                x: CENTER + slot * MAX_OFFSET,
                y,
                id: n.id,
                label: n.label,
                row: rowIdx,
                status: nodeStatus[n.id] || 'locked',
                progress: nodeProgress[n.id] || 0,
            });
            nodeIdx++;
        }
    }

    // Content height: banner + rows + bottom space
    // For non-last sections, add ROW_HEIGHT below last row for exit path to next banner
    const lastRowY = START_Y + (numRows - 1) * ROW_HEIGHT;
    const contentHeight = isLast
        ? lastRowY + 60
        : lastRowY + ROW_HEIGHT;

    // Last node X — used to terminate the path for the last section
    const lastNode = nodePoints[nodePoints.length - 1];
    const lastNodeX = lastNode?.x ?? CENTER;

    // ── Generate snake path ──
    const generateSnakePath = (limit?: { row: number, x: number }) => {
        let d = '';
        let len = 0;
        let cx = 0;
        let cy = 0;

        const addM = (x: number, y: number) => {
            d = `M ${x} ${y}`;
            cx = x;
            cy = y;
        };

        const addL = (x: number, y: number) => {
            d += ` L ${x} ${y}`;
            len += Math.hypot(x - cx, y - cy);
            cx = x;
            cy = y;
        };

        const addQ = (c1x: number, c1y: number, x: number, y: number) => {
            d += ` Q ${c1x} ${c1y} ${x} ${y}`;
            // Approx length of 90-degree curve with control point
            // For a quarter circle, L = (PI * R) / 2
            // Control point distance creates a quadratic bezier.
            // A standard quarter-circle bezier approx is close enough for animation
            len += (Math.PI * CORNER_RADIUS) / 2;
            cx = x;
            cy = y;
        };

        if (numRows === 0) return { d: '', length: 0 };

        // Entry X — from the banner's bottom-left or bottom-right border-radius area
        const entryX = startFromLeft ? X_MIN : X_MAX;
        addM(entryX, BANNER_HEIGHT);

        // Go down from banner bottom to row 0 level
        addL(entryX, START_Y - CORNER_RADIUS);

        // Curve into row 0
        if (startFromLeft) {
            addQ(X_MIN, START_Y, X_MIN + CORNER_RADIUS, START_Y);
        } else {
            addQ(X_MAX, START_Y, X_MAX - CORNER_RADIUS, START_Y);
        }

        // Helper to check if we should stop at the current point
        const shouldStop = (row: number, x: number) => {
            if (!limit) return false;
            // Check if we are at the limit row
            if (row === limit.row) {
                // If we are sweeping right (start < end) and x >= limit
                // If we are sweeping left (start > end) and x <= limit
                // Simplest: just check if we reached the limit point
                // But we only call this when drawing the horizontal line.
                return true;
            }
            return false;
        };

        // Row 0 sweep to far edge
        const row0Right = isSweepRight(0);

        // Handle Row 0 Horizontal limit
        if (limit && limit.row === 0) {
            addL(limit.x, START_Y);
            return { d, length: len };
        }

        if (numRows === 1 && isLast) {
            // Last section, single row — sweep to the final node
            addL(lastNodeX, START_Y);
            return { d, length: len };
        }

        // Full sweep + curve down for Row 0
        if (row0Right) {
            addL(X_MAX - CORNER_RADIUS, START_Y);
            addQ(X_MAX, START_Y, X_MAX, START_Y + CORNER_RADIUS);
        } else {
            addL(X_MIN + CORNER_RADIUS, START_Y);
            addQ(X_MIN, START_Y, X_MIN, START_Y + CORNER_RADIUS);
        }

        // Rows 1+
        for (let rowIdx = 1; rowIdx < numRows; rowIdx++) {
            const currentY = START_Y + rowIdx * ROW_HEIGHT;
            const sweepRight = isSweepRight(rowIdx);
            const isLastRow = rowIdx === numRows - 1;

            // Check if limit is in this row (Horizontal part)
            if (limit && limit.row === rowIdx) {
                // We are coming from the previous row's curve end
                // Previous curver ended at (X_MIN or X_MAX, currentY - CORNER_RADIUS)?
                // Wait, previous loop ended at ... `currentY - CORNER_RADIUS`?
                // Let's trace.
                // Row 0 end: `START_Y + CORNER_RADIUS` = `START_Y + 40`.
                // Row 1 Y = `START_Y + 80`.
                // Between R0 and R1:
                // We are at `(Side, START_Y + 40)`.
                // We need to go down to `(Side, currentY - 40)`.
                // Ah, the straight vertical connector!
                // The original code handled this inside "Row 1+" loop with:
                // `d += L ... (currentY - CORNER_RADIUS)`
                // `d += Q ...`

                // So FIRST we draw the vertical connection from previous row
                if (sweepRight) {
                    addL(X_MIN, currentY - CORNER_RADIUS);
                    addQ(X_MIN, currentY, X_MIN + CORNER_RADIUS, currentY);
                } else {
                    addL(X_MAX, currentY - CORNER_RADIUS);
                    addQ(X_MAX, currentY, X_MAX - CORNER_RADIUS, currentY);
                }

                // NOW we are at start of horizontal sweep for this row.
                // Draw to limit
                addL(limit.x, currentY);
                return { d, length: len };
            }

            if (sweepRight) {
                // Coming from LEFT edge
                addL(X_MIN, currentY - CORNER_RADIUS);
                addQ(X_MIN, currentY, X_MIN + CORNER_RADIUS, currentY);

                if (isLastRow && isLast) {
                    // End at the final node
                    addL(lastNodeX, currentY);
                } else {
                    addL(X_MAX - CORNER_RADIUS, currentY);
                    if (!isLastRow || !isLast) {
                        addQ(X_MAX, currentY, X_MAX, currentY + CORNER_RADIUS);
                    }
                }
            } else {
                // Coming from RIGHT edge
                addL(X_MAX, currentY - CORNER_RADIUS);
                addQ(X_MAX, currentY, X_MAX - CORNER_RADIUS, currentY);

                if (isLastRow && isLast) {
                    // End at the final node
                    addL(lastNodeX, currentY);
                } else {
                    addL(X_MIN + CORNER_RADIUS, currentY);
                    if (!isLastRow || !isLast) {
                        addQ(X_MIN, currentY, X_MIN, currentY + CORNER_RADIUS);
                    }
                }
            }
        }

        // Exit: continue down to the next banner area (solid snake, not dashed)
        if (!isLast && !limit) {
            const exitSide = computeExitSide(rowPattern, startFromLeft);
            const exitX = exitSide === 'right' ? X_MAX : X_MIN;
            addL(exitX, contentHeight);
        }

        return { d, length: len };
    };

    const fullPathData = generateSnakePath();
    const snakePath = fullPathData.d;

    // Find highest unlocked node
    // Assuming nodePoints are sorted by appearance order (which they are)
    // We want the LAST node that is NOT locked.
    // If all are locked (e.g. first node locked?), default to first node or start? (Shouldn't happen for active category)
    // If all completed, use last node.
    let targetNode = null;
    for (let i = nodePoints.length - 1; i >= 0; i--) {
        if (nodePoints[i].status !== 'locked') {
            targetNode = nodePoints[i];
            break;
        }
    }
    // If no node is unlocked (edge case), animate to start? or 0 length.
    // If we have a target node, limit path to it.
    const activePathData = targetNode
        ? generateSnakePath({ row: targetNode.row, x: targetNode.x })
        : { d: '', length: 0 };

    const animatedPathProps = useAnimatedProps(() => ({
        strokeDashoffset: activePathData.length * (1 - pathProgress.value),
    }));

    const handleNodePress = (nodeId: number, status: string) => {
        if (status === 'active' || status === 'completed') {
            router.push(`/quiz/${nodeId}`);
        }
    };

    return (
        <View style={styles.sectionContainer}>
            <View style={[styles.mapContainer, { height: contentHeight }]}>
                {/* SVG Snake Path */}
                <Svg
                    height={contentHeight}
                    width={CONTENT_WIDTH}
                    style={StyleSheet.absoluteFill}
                >
                    {snakePath ? (
                        <>
                            <Path
                                d={snakePath}
                                stroke={phase.light}
                                strokeWidth={20}
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <AnimatedPath
                                d={activePathData.d}
                                stroke={phase.primary}
                                strokeWidth={6}
                                fill="none"
                                strokeDasharray={activePathData.length}
                                animatedProps={animatedPathProps}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                opacity={0.6}
                            />
                        </>
                    ) : null}
                </Svg>

                {/* Category Banner — sits inside the map, over the snake */}
                <View style={[styles.banner, { backgroundColor: phase.primary }]}>
                    <View style={styles.bannerIndex}>
                        <Text style={styles.bannerIndexText}>{phaseIndex}</Text>
                    </View>
                    <Text style={styles.bannerTitle}>{title}</Text>
                </View>

                {/* Nodes */}
                {nodePoints.map((node, index) => (
                    <RoadmapNode
                        key={node.id}
                        node={node}
                        index={index}
                        phaseColor={phase.primary}
                        phaseLightColor={phase.light}
                        onPress={() => handleNodePress(node.id, node.status)}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    sectionContainer: {
        marginBottom: 0,
    },
    banner: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 16,
        zIndex: 20,
    },
    bannerIndex: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    bannerIndexText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '800',
    },
    bannerTitle: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
    },
    mapContainer: {
        position: 'relative',
        marginHorizontal: 16,
    },
});
