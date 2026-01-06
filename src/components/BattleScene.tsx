import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface BattleSceneProps {
    bossPosition: number;
    energy: number;
}

export default function BattleScene({ bossPosition, energy }: BattleSceneProps) {
    const bossX = useRef(new Animated.Value(200)).current;
    const playerShake = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const targetX = 200 - bossPosition * 80;
        Animated.spring(bossX, {
            toValue: targetX,
            useNativeDriver: true,
            damping: 15,
            stiffness: 100,
        }).start();
    }, [bossPosition]);

    useEffect(() => {
        if (bossPosition >= 3) {
            Animated.sequence([
                Animated.timing(playerShake, { toValue: -10, duration: 50, useNativeDriver: true }),
                Animated.timing(playerShake, { toValue: 10, duration: 50, useNativeDriver: true }),
                Animated.timing(playerShake, { toValue: -10, duration: 50, useNativeDriver: true }),
                Animated.timing(playerShake, { toValue: 0, duration: 50, useNativeDriver: true }),
            ]).start();
        }
    }, [bossPosition]);

    return (
        <View style={styles.container}>
            <View style={styles.background}>
                <View style={styles.ground} />
            </View>

            <View style={styles.battleArea}>
                <Animated.View style={[styles.player, { transform: [{ translateX: playerShake }] }]}>
                    <Text style={styles.playerEmoji}>🐲</Text>
                    <View style={styles.characterLabel}>
                        <Text style={styles.labelText}>勇士</Text>
                    </View>
                </Animated.View>

                <View style={styles.distanceIndicator}>
                    {[0, 1, 2].map((step) => (
                        <View
                            key={step}
                            style={[
                                styles.distanceStep,
                                step < bossPosition && styles.distanceStepDanger,
                            ]}
                        />
                    ))}
                </View>

                <Animated.View style={[styles.boss, { transform: [{ translateX: bossX }] }]}>
                    <Text style={styles.bossEmoji}>👹</Text>
                    <View style={styles.characterLabel}>
                        <Text style={styles.labelText}>字妖</Text>
                    </View>
                </Animated.View>
            </View>

            <View style={styles.statusHint}>
                {bossPosition === 0 && (
                    <Text style={styles.statusText}>👍 保持距离！继续书写</Text>
                )}
                {bossPosition === 1 && (
                    <Text style={[styles.statusText, styles.statusWarning]}>⚠️ 字妖在逼近...</Text>
                )}
                {bossPosition === 2 && (
                    <Text style={[styles.statusText, styles.statusDanger]}>🚨 危险！再错一次就会受伤</Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 180,
        overflow: 'hidden',
    },
    background: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#16213e',
    },
    ground: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 40,
        backgroundColor: '#0f3460',
    },
    battleArea: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingBottom: 50,
        paddingHorizontal: 20,
    },
    player: {
        alignItems: 'center',
    },
    playerEmoji: {
        fontSize: 60,
    },
    boss: {
        alignItems: 'center',
        position: 'absolute',
        right: 20,
        bottom: 50,
    },
    bossEmoji: {
        fontSize: 70,
    },
    characterLabel: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 4,
    },
    labelText: {
        color: '#fff',
        fontSize: 12,
    },
    distanceIndicator: {
        position: 'absolute',
        bottom: 30,
        left: 100,
        right: 100,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    distanceStep: {
        width: 30,
        height: 6,
        backgroundColor: '#27ae60',
        borderRadius: 3,
    },
    distanceStepDanger: {
        backgroundColor: '#e94560',
    },
    statusHint: {
        position: 'absolute',
        top: 8,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    statusText: {
        color: '#888',
        fontSize: 14,
    },
    statusWarning: {
        color: '#f39c12',
    },
    statusDanger: {
        color: '#e94560',
        fontWeight: 'bold',
    },
});
