import React from 'react';
import { StyleSheet, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { Colors, Radius, Spacing } from '../../constants/theme';
import { Typography } from './Typography';

interface QuickActionChipProps extends TouchableOpacityProps {
    label: string;
    icon?: React.ReactNode;
}

export function QuickActionChip({ label, icon, style, ...props }: QuickActionChipProps) {
    return (
        <TouchableOpacity style={[styles.chip, style]} activeOpacity={0.7} {...props}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Typography variant="caption" weight="medium" color="default">
                {label}
            </Typography>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light.background,
        borderWidth: 1,
        borderColor: Colors.light.border,
        borderRadius: Radius.full,
        paddingVertical: Spacing.s,
        paddingHorizontal: Spacing.m,
        marginRight: Spacing.s,
    },
    iconContainer: {
        marginRight: Spacing.xs,
    },
});
