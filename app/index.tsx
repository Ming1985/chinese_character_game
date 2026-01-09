import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getTodayPracticeCount } from '../src/lib/database';

export default function HomeScreen() {
    const [todayCount, setTodayCount] = useState(0);

    // 每次页面获得焦点时刷新
    useFocusEffect(
        useCallback(() => {
            getTodayPracticeCount().then(setTodayCount).catch(console.error);
        }, [])
    );

    return (
        <View style={styles.container}>
            {/* 设置按钮 */}
            <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => router.push('/settings')}
            >
                <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>

            <View style={styles.header}>
                <Text style={styles.title}>汉字小勇士</Text>
                <Text style={styles.subtitle}>书写汉字，击败怪兽</Text>
            </View>

            <View style={styles.mascot}>
                <View style={styles.mascotPlaceholder}>
                    <Text style={styles.mascotEmoji}>🐲</Text>
                </View>
            </View>

            <View style={styles.menu}>
                <Link href="/textbooks" style={styles.menuButton} accessibilityLabel="开始冒险" testID="start-adventure-btn">
                    <Text style={styles.menuButtonText}>开始冒险</Text>
                </Link>

                <Link href="/review" style={[styles.menuButton, styles.menuButtonSecondary]} accessibilityLabel="每日复习" testID="daily-review-btn">
                    <Text style={styles.menuButtonText}>每日复习</Text>
                </Link>

                <Link href="/report" style={[styles.menuButton, styles.menuButtonTertiary]} accessibilityLabel="学习报告" testID="learning-report-btn">
                    <Text style={styles.menuButtonText}>学习报告</Text>
                </Link>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>今日已练习: {todayCount} 字</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
        padding: 20,
    },
    settingsButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        padding: 8,
    },
    settingsIcon: {
        fontSize: 28,
    },
    header: {
        alignItems: 'center',
        marginTop: 40,
    },
    title: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#eee',
    },
    subtitle: {
        fontSize: 16,
        color: '#aaa',
        marginTop: 8,
    },
    mascot: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mascotPlaceholder: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#16213e',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#f39c12',
    },
    mascotEmoji: {
        fontSize: 100,
    },
    menu: {
        marginBottom: 40,
    },
    menuButton: {
        marginTop: 16,
        backgroundColor: '#e94560',
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
    },
    menuButtonSecondary: {
        backgroundColor: '#0f3460',
    },
    menuButtonTertiary: {
        backgroundColor: '#16213e',
        borderWidth: 2,
        borderColor: '#0f3460',
    },
    menuButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
    },
    footer: {
        alignItems: 'center',
        paddingBottom: 20,
    },
    footerText: {
        color: '#666',
        fontSize: 14,
    },
});
