import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    getOverallStats,
    getWeeklyStats,
    getDifficultCharacters,
    getMasteredCount,
    getReviewCount,
} from '../src/lib/database';
import { getCharacterById } from '../src/data';

// 统计数据类型
interface ReportData {
    totalPracticed: number;
    accuracy: number;
    masteredCount: number;
    reviewCount: number;
    weeklyStats: Array<{ date: string; practiced: number }>;
    difficultChars: Array<{
        charId: string;
        char: string;
        pinyin: string;
        wrongCount: number;
    }>;
}

export default function ReportScreen() {
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;
    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);

    // 加载统计数据
    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        try {
            setLoading(true);
            const [overall, weekly, difficult, mastered, review] = await Promise.all([
                getOverallStats(),
                getWeeklyStats(),
                getDifficultCharacters(5),
                getMasteredCount(),
                getReviewCount(),
            ]);

            // 获取难字的详细信息
            const difficultChars = difficult.map(d => {
                const char = getCharacterById(d.charId);
                return {
                    charId: d.charId,
                    char: char?.char ?? d.charId,
                    pinyin: char?.pinyin ?? '',
                    wrongCount: d.wrongCount,
                };
            });

            setData({
                totalPracticed: overall.totalPracticed,
                accuracy: overall.accuracy,
                masteredCount: mastered,
                reviewCount: review,
                weeklyStats: weekly,
                difficultChars,
            });
        } catch (error) {
            console.error('加载统计数据失败:', error);
        } finally {
            setLoading(false);
        }
    };

    // 获取星期几缩写
    const getWeekdayLabel = (dateStr: string) => {
        const days = ['日', '一', '二', '三', '四', '五', '六'];
        const date = new Date(dateStr + 'T00:00:00');
        return days[date.getDay()];
    };

    // 计算柱状图最大高度
    const maxPracticed = Math.max(...(data?.weeklyStats.map(s => s.practiced) ?? [1]), 1);

    return (
        <SafeAreaView style={styles.container}>
            {/* 头部 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← 返回</Text>
                </TouchableOpacity>
                <Text style={styles.title}>学习报告</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>加载中...</Text>
                    </View>
                ) : data ? (
                    <>
                        {/* 统计卡片 */}
                        <View style={[styles.cardsRow, isTablet && styles.cardsRowTablet]}>
                            <View style={[styles.card, styles.cardPrimary]}>
                                <Text style={styles.cardValue}>{data.totalPracticed}</Text>
                                <Text style={styles.cardLabel}>累计练习</Text>
                            </View>
                            <View style={[styles.card, styles.cardAccuracy]}>
                                <Text style={styles.cardValue}>
                                    {Math.round(data.accuracy * 100)}%
                                </Text>
                                <Text style={styles.cardLabel}>正确率</Text>
                            </View>
                        </View>

                        <View style={[styles.cardsRow, isTablet && styles.cardsRowTablet]}>
                            <View style={[styles.card, styles.cardMastered]}>
                                <Text style={styles.cardValue}>{data.masteredCount}</Text>
                                <Text style={styles.cardLabel}>已掌握</Text>
                            </View>
                            <View style={[styles.card, styles.cardReview]}>
                                <Text style={styles.cardValue}>{data.reviewCount}</Text>
                                <Text style={styles.cardLabel}>待复习</Text>
                            </View>
                        </View>

                        {/* 本周趋势 */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>📊 本周练习</Text>
                            <View style={styles.chartContainer}>
                                {data.weeklyStats.map((stat, index) => (
                                    <View key={stat.date} style={styles.chartBar}>
                                        <Text style={styles.chartValue}>
                                            {stat.practiced > 0 ? stat.practiced : ''}
                                        </Text>
                                        <View
                                            style={[
                                                styles.bar,
                                                {
                                                    height: Math.max(
                                                        (stat.practiced / maxPracticed) * 100,
                                                        stat.practiced > 0 ? 8 : 4
                                                    ),
                                                    backgroundColor:
                                                        stat.practiced > 0 ? '#27ae60' : '#333',
                                                },
                                            ]}
                                        />
                                        <Text style={styles.chartLabel}>
                                            {getWeekdayLabel(stat.date)}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* 易错字 */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>⚠️ 易错字</Text>
                            {data.difficultChars.length > 0 ? (
                                <View style={styles.difficultList}>
                                    {data.difficultChars.map((item, index) => (
                                        <View key={item.charId} style={styles.difficultItem}>
                                            <View style={styles.difficultRank}>
                                                <Text style={styles.rankText}>{index + 1}</Text>
                                            </View>
                                            <Text style={styles.difficultChar}>{item.char}</Text>
                                            <Text style={styles.difficultPinyin}>
                                                {item.pinyin}
                                            </Text>
                                            <Text style={styles.difficultWrong}>
                                                错{item.wrongCount}次
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyText}>暂无易错字，继续加油！</Text>
                                </View>
                            )}
                        </View>

                        {/* 底部间距 */}
                        <View style={{ height: 40 }} />
                    </>
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>暂无学习数据</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#0f3460',
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        color: '#f39c12',
        fontSize: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#eee',
    },
    placeholder: {
        width: 60,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    loadingText: {
        color: '#888',
        fontSize: 16,
    },

    // 卡片样式
    cardsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    cardsRowTablet: {
        gap: 20,
    },
    card: {
        flex: 1,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
    },
    cardPrimary: {
        backgroundColor: '#e94560',
    },
    cardAccuracy: {
        backgroundColor: '#0f3460',
    },
    cardMastered: {
        backgroundColor: '#27ae60',
    },
    cardReview: {
        backgroundColor: '#f39c12',
    },
    cardValue: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
    },
    cardLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },

    // 图表样式
    section: {
        backgroundColor: '#16213e',
        borderRadius: 16,
        padding: 16,
        marginTop: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#eee',
        marginBottom: 16,
    },
    chartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 140,
        paddingTop: 20,
    },
    chartBar: {
        flex: 1,
        alignItems: 'center',
    },
    chartValue: {
        fontSize: 12,
        color: '#27ae60',
        marginBottom: 4,
        height: 16,
    },
    bar: {
        width: 24,
        borderRadius: 4,
        minHeight: 4,
    },
    chartLabel: {
        fontSize: 12,
        color: '#888',
        marginTop: 8,
    },

    // 易错字样式
    difficultList: {
        gap: 8,
    },
    difficultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 12,
    },
    difficultRank: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#e74c3c',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    rankText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    difficultChar: {
        fontSize: 28,
        color: '#fff',
        marginRight: 8,
    },
    difficultPinyin: {
        fontSize: 14,
        color: '#888',
        flex: 1,
    },
    difficultWrong: {
        fontSize: 12,
        color: '#e74c3c',
    },

    // 空状态
    emptyState: {
        padding: 24,
        alignItems: 'center',
    },
    emptyText: {
        color: '#888',
        fontSize: 14,
    },
});
