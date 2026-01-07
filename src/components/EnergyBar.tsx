import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';

interface EnergyBarProps {
    energy: number;
    onUltimate: () => void;
}

export default function EnergyBar({ energy, onUltimate }: EnergyBarProps) {
    const fillWidth = useRef(new Animated.Value(0)).current;
    const isFull = energy >= 100;

    useEffect(() => {
        Animated.spring(fillWidth, {
            toValue: energy,
            useNativeDriver: false,
            damping: 15,
            stiffness: 100,
        }).start();
    }, [energy]);

    const widthInterpolate = fillWidth.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={styles.container}>
            <View style={styles.barContainer}>
                <View style={styles.barBackground}>
                    <Animated.View
                        style={[
                            styles.barFill,
                            { width: widthInterpolate },
                            isFull && styles.barFillFull,
                        ]}
                    />
                </View>
                <Text style={styles.label}>能量</Text>
            </View>

            {isFull && (
                <TouchableOpacity style={styles.ultimateButton} onPress={onUltimate}>
                    <Text style={styles.ultimateText}>⚡ 必杀</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    barContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
    },
    label: {
        color: '#888',
        fontSize: 12,
        marginLeft: 8,
    },
    barBackground: {
        width: 120,
        height: 16,
        backgroundColor: '#0a0a15',
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#333',
    },
    barFill: {
        height: '100%',
        backgroundColor: '#3498db',
        borderRadius: 6,
    },
    barFillFull: {
        backgroundColor: '#f39c12',
    },
    ultimateButton: {
        backgroundColor: '#f39c12',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 4,
    },
    ultimateText: {
        color: '#000',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
