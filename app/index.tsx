import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getTodayPracticeCount } from '../src/lib/database';

export default function HomeScreen() {
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;
    const [todayCount, setTodayCount] = useState(0);

    // 每次页面获得焦点时刷新
    useFocusEffect(
        useCallback(() => {
            getTodayPracticeCount().then(setTodayCount).catch(console.error);
        }, [])
    );

    // 按钮最大宽度
    const buttonMaxWidth = isTablet ? 320 : 280;

    return (
        <View style={styles.container}>
            {/* 设置按钮 */}
            <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => router.push('/settings')}
            >
                <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>

            {/* 标题区 */}
            <View style={styles.header}>
                <Text style={styles.title}>汉字小勇士</Text>
                <Text style={styles.subtitle}>书写汉字，击败怪兽</Text>
            </View>

            {/* 主角 */}
            <View style={styles.mascotArea}>
                <View style={styles.mascotCircle}>
                    <Text style={styles.mascotEmoji}>🐲</Text>
                </View>
            </View>

            {/* 菜单按钮 */}
            <View style={styles.menuArea}>
                <TouchableOpacity
                    style={[styles.menuButton, styles.menuButtonPrimary, { maxWidth: buttonMaxWidth }]}
                    onPress={() => router.push('/textbooks')}
                    accessibilityLabel="开始冒险"
                    testID="start-adventure-btn"
                >
                    <Text style={styles.menuButtonText}>开始冒险</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.menuButton, styles.menuButtonSecondary, { maxWidth: buttonMaxWidth }]}
                    onPress={() => router.push('/review')}
                    accessibilityLabel="每日复习"
                    testID="daily-review-btn"
                >
                    <Text style={styles.menuButtonText}>每日复习</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.menuButton, styles.menuButtonGame, { maxWidth: buttonMaxWidth }]}
                    onPress={() => router.push('/mini-games')}
                    accessibilityLabel="小游戏"
                    testID="mini-games-btn"
                >
                    <Text style={styles.menuButtonText}>小游戏</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.menuButton, styles.menuButtonTertiary, { maxWidth: buttonMaxWidth }]}
                    onPress={() => router.push('/report')}
                    accessibilityLabel="学习报告"
                    testID="learning-report-btn"
                >
                    <Text style={styles.menuButtonText}>学习报告</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.menuButton, styles.menuButtonShop, { maxWidth: buttonMaxWidth }]}
                    onPress={() => router.push('/shop')}
                    accessibilityLabel="商店"
                    testID="shop-btn"
                >
                    <Text style={styles.menuButtonText}>商店</Text>
                </TouchableOpacity>
            </View>

            {/* 底部统计 */}
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
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 24,
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

    // 标题
    header: {
        alignItems: 'center',
    },
    title: {
        fontSize: 38,
        fontWeight: 'bold',
        color: '#eee',
    },
    subtitle: {
        fontSize: 15,
        color: '#888',
        marginTop: 6,
    },

    // 主角区域
    mascotArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mascotCircle: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: '#16213e',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#f39c12',
    },
    mascotEmoji: {
        fontSize: 80,
    },

    // 菜单区域
    menuArea: {
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    menuButton: {
        width: '100%',
        paddingVertical: 14,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuButtonPrimary: {
        backgroundColor: '#e94560',
    },
    menuButtonSecondary: {
        backgroundColor: '#0f3460',
    },
    menuButtonGame: {
        backgroundColor: '#9b59b6',
    },
    menuButtonShop: {
        backgroundColor: '#f39c12',
    },
    menuButtonTertiary: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#0f3460',
    },
    menuButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },

    // 底部
    footer: {
        alignItems: 'center',
    },
    footerText: {
        color: '#555',
        fontSize: 13,
    },
});
