import { Colors } from '@/constants/theme';
import { RoadmapNodeConfig } from '@/data/roadmap-config';
import { useUserStore } from '@/store/useUserStore';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { RoadmapNode } from './RoadmapNode';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CategorySectionProps {
    title: string;
    phaseIndex: 1 | 2 | 3 | 4;
    prevPhaseIndex?: 1 | 2 | 3 | 4;
    nodes: RoadmapNodeConfig[];
    rowPattern: number[];
    startFromLeft?: boolean;
    isFirst?: boolean;
    isLast?: boolean;
    isPro: boolean;
    onPressPaywall: () => void;
    /** The single globally-current node id (last accessed across all sections, or 1). */
    currentNodeId: number;
}

// ── Layout constants ──
const SECTION_PADDING = 16;
const CONTENT_WIDTH = SCREEN_WIDTH - SECTION_PADDING * 2;
const ROW_HEIGHT = 90;
const BANNER_HEIGHT = 46;
const BANNER_TOP = 24;
const CORNER_RADIUS = 45;
const X_MIN = 24;
const BANNER_WIDTH = CONTENT_WIDTH - 2 * (X_MIN + CORNER_RADIUS);
const BANNER_LEFT = (CONTENT_WIDTH - BANNER_WIDTH) / 2;
const BANNER_RIGHT = BANNER_LEFT + BANNER_WIDTH;
const BANNER_MID_Y = BANNER_TOP + BANNER_HEIGHT / 2;
const FIRST_ROW_GAP = Math.round(ROW_HEIGHT * 0.8);
const START_Y = BANNER_TOP + BANNER_HEIGHT + FIRST_ROW_GAP;
const CENTER = CONTENT_WIDTH / 2;
const MAX_OFFSET = CONTENT_WIDTH * 0.22;
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
    prevPhaseIndex,
    nodes,
    rowPattern,
    startFromLeft = true,
    isFirst = false,
    isLast = false,
    isPro,
    onPressPaywall,
    currentNodeId,
}: CategorySectionProps) {
    const router = useRouter();
    const nodeStatus = useUserStore((s) => s.nodeStatus);
    const nodeProgress = useUserStore((s) => s.nodeProgress);

    const theme = Colors.light;
    const phase = theme.phase[phaseIndex];
    const prevPhase = prevPhaseIndex ? theme.phase[prevPhaseIndex] : null;

    const numRows = rowPattern.length;
    const isSweepRight = (rowIdx: number) =>
        startFromLeft ? rowIdx % 2 === 0 : rowIdx % 2 !== 0;

    // currentNodeId is passed from the parent (computed globally across all sections).

    // ── Compute node positions ──
    type NodePoint = {
        x: number; y: number; id: number; label: string;
        labelEn?: string; labelVn?: string;
        topicId?: string; row: number; status: string; progress: number;
        isPremiumLocked: boolean;
    };
    const nodePoints: NodePoint[] = [];

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

            // Free users: only node 1 free, all others premium-locked
            const premiumLocked = !isPro && n.id !== 1;

            let effectiveStatus: string;
            if (premiumLocked) {
                effectiveStatus = 'locked'; // will render with crown badge via isPremiumLocked
            } else {
                const stored = nodeStatus[n.id] || 'locked';
                if (stored === 'completed') {
                    effectiveStatus = 'completed';
                } else if (n.id === currentNodeId) {
                    // Current node: pulsing active animation
                    effectiveStatus = 'active';
                } else if (isPro) {
                    // Pro user: all non-completed, non-current nodes are accessible
                    effectiveStatus = 'accessible';
                } else {
                    effectiveStatus = stored;
                }
            }

            nodePoints.push({
                x: CENTER + slot * MAX_OFFSET,
                y,
                id: n.id,
                label: n.label,
                labelEn: n.labelEn,
                labelVn: n.labelVn,
                topicId: n.topicId,
                row: rowIdx,
                status: effectiveStatus,
                progress: nodeProgress[n.id] || 0,
                isPremiumLocked: premiumLocked,
            });
            nodeIdx++;
        }
    }

    // Content height: banner + rows + bottom space
    const lastRowY = START_Y + (numRows - 1) * ROW_HEIGHT;
    const contentHeight = isLast
        ? lastRowY + 40
        : lastRowY + ROW_HEIGHT * 0.5;

    const lastNode = nodePoints[nodePoints.length - 1];
    const lastNodeX = lastNode?.x ?? CENTER;

    // ── Generate snake path ──
    const generateSnakePath = (limit?: { row: number; x: number }) => {
        let d = '';
        let cx = 0;
        let cy = 0;

        const addM = (x: number, y: number) => { d = `M ${x} ${y}`; cx = x; cy = y; };
        const addL = (x: number, y: number) => { d += ` L ${x} ${y}`; cx = x; cy = y; };
        const addQ = (c1x: number, c1y: number, x: number, y: number) => {
            d += ` Q ${c1x} ${c1y} ${x} ${y}`; cx = x; cy = y;
        };

        if (numRows === 0) return d;

        if (startFromLeft) {
            addM(BANNER_LEFT, BANNER_MID_Y);
            addQ(X_MIN, BANNER_MID_Y, X_MIN, BANNER_MID_Y + CORNER_RADIUS);
            addL(X_MIN, START_Y - CORNER_RADIUS);
            addQ(X_MIN, START_Y, X_MIN + CORNER_RADIUS, START_Y);
        } else {
            addM(BANNER_RIGHT, BANNER_MID_Y);
            addQ(X_MAX, BANNER_MID_Y, X_MAX, BANNER_MID_Y + CORNER_RADIUS);
            addL(X_MAX, START_Y - CORNER_RADIUS);
            addQ(X_MAX, START_Y, X_MAX - CORNER_RADIUS, START_Y);
        }

        if (limit && limit.row === 0) { addL(limit.x, START_Y); return d; }
        if (numRows === 1 && isLast) { addL(lastNodeX, START_Y); return d; }

        const row0Right = isSweepRight(0);
        if (row0Right) {
            addL(X_MAX - CORNER_RADIUS, START_Y);
            addQ(X_MAX, START_Y, X_MAX, START_Y + CORNER_RADIUS);
        } else {
            addL(X_MIN + CORNER_RADIUS, START_Y);
            addQ(X_MIN, START_Y, X_MIN, START_Y + CORNER_RADIUS);
        }

        for (let rowIdx = 1; rowIdx < numRows; rowIdx++) {
            const currentY = START_Y + rowIdx * ROW_HEIGHT;
            const sweepRight = isSweepRight(rowIdx);
            const isLastRow = rowIdx === numRows - 1;

            if (limit && limit.row === rowIdx) {
                if (sweepRight) {
                    addL(X_MIN, currentY - CORNER_RADIUS);
                    addQ(X_MIN, currentY, X_MIN + CORNER_RADIUS, currentY);
                } else {
                    addL(X_MAX, currentY - CORNER_RADIUS);
                    addQ(X_MAX, currentY, X_MAX - CORNER_RADIUS, currentY);
                }
                addL(limit.x, currentY);
                return d;
            }

            if (sweepRight) {
                addL(X_MIN, currentY - CORNER_RADIUS);
                addQ(X_MIN, currentY, X_MIN + CORNER_RADIUS, currentY);
                if (isLastRow && isLast) {
                    addL(lastNodeX, currentY);
                } else {
                    addL(X_MAX - CORNER_RADIUS, currentY);
                    if (!isLastRow || !isLast) addQ(X_MAX, currentY, X_MAX, currentY + CORNER_RADIUS);
                }
            } else {
                addL(X_MAX, currentY - CORNER_RADIUS);
                addQ(X_MAX, currentY, X_MAX - CORNER_RADIUS, currentY);
                if (isLastRow && isLast) {
                    addL(lastNodeX, currentY);
                } else {
                    addL(X_MIN + CORNER_RADIUS, currentY);
                    if (!isLastRow || !isLast) addQ(X_MIN, currentY, X_MIN, currentY + CORNER_RADIUS);
                }
            }
        }

        if (!isLast && !limit) {
            const exitSide = computeExitSide(rowPattern, startFromLeft);
            addL(exitSide === 'right' ? X_MAX : X_MIN, contentHeight);
        }

        return d;
    };

    const snakePath = generateSnakePath();

    // Arrival path — connector from the previous section's exit rail into this banner
    let arrivalPath = '';
    if (!isFirst) {
        const arrivalX = startFromLeft ? X_MAX : X_MIN;
        const nearEdge = startFromLeft ? BANNER_RIGHT : BANNER_LEFT;
        const curveStart = Math.max(0, BANNER_MID_Y - CORNER_RADIUS);
        arrivalPath = `M ${arrivalX} 0 L ${arrivalX} ${curveStart} Q ${arrivalX} ${BANNER_MID_Y} ${nearEdge} ${BANNER_MID_Y}`;
    }

    // Free-user inner path: highlight banner → node 1 in the first section only.
    // This shows the one accessible entry point visually.
    const freeUserInnerPath = (!isPro && isFirst && nodePoints.length > 0)
        ? generateSnakePath({ row: nodePoints[0].row, x: nodePoints[0].x })
        : '';

    const handleNodePress = (node: NodePoint) => {
        if (node.isPremiumLocked) {
            onPressPaywall();
            return;
        }
        // Progress-locked free node (only happens if node status is locked and not premium locked)
        if (node.status === 'locked') return;

        router.push({
            pathname: '/topic/[topicId]',
            params: {
                topicId: node.topicId || node.id.toString(),
                topicName: node.label,
                topicNameEn: node.labelEn,
                topicNameVn: node.labelVn,
                phaseIndex: phaseIndex.toString(),
                nodeOrder: node.id.toString(),
                totalNodes: nodes.length.toString(),
            },
        });
    };

    return (
        <View style={styles.sectionContainer}>
            <View style={[styles.mapContainer, { height: contentHeight }]}>
                <Svg
                    height={contentHeight}
                    width={CONTENT_WIDTH}
                    style={StyleSheet.absoluteFill}
                >
                    {/* Arrival path from previous section — uses prev phase color */}
                    {arrivalPath && prevPhase ? (
                        <Path
                            d={arrivalPath}
                            stroke={prevPhase.light}
                            strokeWidth={14}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    ) : null}

                    {/* Full grey background path */}
                    {snakePath ? (
                        <Path
                            d={snakePath}
                            stroke={phase.light}
                            strokeWidth={14}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    ) : null}

                    {/* Free-user inner path: banner → node 1 (first section only) */}
                    {freeUserInnerPath ? (
                        <Path
                            d={freeUserInnerPath}
                            stroke={phase.primary}
                            strokeWidth={4}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            opacity={0.7}
                        />
                    ) : null}
                </Svg>

                {/* Category Banner */}
                <View style={[styles.banner, { backgroundColor: phase.primary }]}>
                    <Text style={styles.bannerTitle} numberOfLines={1}>{title}</Text>
                </View>

                {/* Nodes */}
                {nodePoints.map((node, index) => (
                    <RoadmapNode
                        key={node.id}
                        node={node}
                        index={index}
                        phaseColor={phase.primary}
                        phaseLightColor={phase.light}
                        isPremiumLocked={node.isPremiumLocked}
                        onPress={() => handleNodePress(node)}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    sectionContainer: { marginBottom: 0 },
    banner: {
        position: 'absolute',
        top: BANNER_TOP,
        left: BANNER_LEFT,
        width: BANNER_WIDTH,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 16,
        zIndex: 20,
    },
    bannerTitle: { color: '#FFF', fontSize: 13, fontWeight: '700', textAlign: 'center' },
    mapContainer: { position: 'relative', marginHorizontal: 16 },
});
