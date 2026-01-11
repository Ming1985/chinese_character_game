import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getPracticeDates, getDailyPracticeDetails } from '../src/lib/database';
import { getCharacterById } from '../src/data';

interface CharDetail {
    charId: string;
    char: string;
    pinyin: string;
    correctCount: number;
    wrongCount: number;
}

export default function DailyDetailScreen() {
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;
    const charsPerRow = isTablet ? 6 : 4;

    const [dates, setDates] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [details, setDetails] = useState<CharDetail[]>([]);
    const [loading, setLoading] = useState(true);

    // 加载日期列表
    useFocusEffect(
        useCallback(() => {
            loadDates();
        }, [])
    );

    // 当选中日期变化时加载详情
    useEffect(() => {
        if (selectedDate) {
            loadDetails(selectedDate);
        }
    }, [selectedDate]);

    const loadDates = async () => {
        try {
            setLoading(true);
            const practDates = await getPracticeDates(30);
            setDates(practDates);
            if (practDates.length > 0) {
                setSelectedDate(practDates[0]); // 默认选中最新日期
            }
        } catch (error) {
            console.error('加载日期失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadDetails = async (date: string) => {
        try {
            const data = await getDailyPracticeDetails(date);
            const charDetails = data.map(d => {
                const char = getCharacterById(d.charId);
                return {
                    charId: d.charId,
                    char: char?.char ?? d.charId,
                    pinyin: char?.pinyin ?? '',
                    correctCount: d.correctCount,
                    wrongCount: d.wrongCount,
                };
            });
            setDetails(charDetails);
        } catch (error) {
            console.error('加载详情失败:', error);
            setDetails([]);
        }
    };

    // 格式化日期显示
    const formatDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-');
        return `${parseInt(month)}/${parseInt(day)}`;
    };

    // 获取汉字背景色
    const getCharColor = (wrongCount: number) => {
        if (wrongCount === 0) return '#27ae60'; // 绿色 - 全对
        if (wrongCount === 1) return '#f39c12'; // 黄色 - 错1次
        return '#e74c3c'; // 红色 - 错2次以上
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* 头部 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← 返回</Text>
                </TouchableOpacity>
                <Text style={styles.title}>练习详情</Text>
                <View style={styles.placeholder} />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>加载中...</Text>
                </View>
            ) : dates.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyEmoji}>📝</Text>
                    <Text style={styles.emptyText}>还没有练习记录</Text>
                    <Text style={styles.emptySubtext}>开始练习后这里会显示每天的学习情况</Text>
                </View>
            ) : (
                <>
                    {/* 日期选择器 */}
                    <View style={styles.dateSection}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.dateList}
                        >
                            {dates.map((date) => (
                                <TouchableOpacity
                                    key={date}
                                    style={[
                                        styles.dateChip,
                                        selectedDate === date && styles.dateChipActive,
                                    ]}
                                    onPress={() => setSelectedDate(date)}
                                >
                                    <Text
                                        style={[
                                            styles.dateChipText,
                                            selectedDate === date && styles.dateChipTextActive,
                                        ]}
                                    >
                                        {formatDate(date)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* 汉字网格 */}
                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {details.length > 0 ? (
                            <View style={styles.charGrid}>
                                {details.map((item) => (
                                    <View
                                        key={item.charId}
                                        style={[
                                            styles.charItem,
                                            {
                                                width: (width - 48) / charsPerRow - 8,
                                                backgroundColor: getCharColor(item.wrongCount),
                                            },
                                        ]}
                                    >
                                        <Text style={styles.charText}>{item.char}</Text>
                                        <Text style={styles.pinyinText}>{item.pinyin}</Text>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View style={styles.noDataContainer}>
                                <Text style={styles.noDataText}>这天没有练习记录</Text>
                            </View>
                        )}

                        {/* 图例 */}
                        {details.length > 0 && (
                            <View style={styles.legend}>
                                <View style={styles.legendItem}>
                                    <View style={[styles.legendDot, { backgroundColor: '#27ae60' }]} />
                                    <Text style={styles.legendText}>全对</Text>
                                </View>
                                <View style={styles.legendItem}>
                                    <View style={[styles.legendDot, { backgroundColor: '#f39c12' }]} />
                                    <Text style={styles.legendText}>错1次</Text>
                                </View>
                                <View style={styles.legendItem}>
                                    <View style={[styles.legendDot, { backgroundColor: '#e74c3c' }]} />
                                    <Text style={styles.legendText}>错2次+</Text>
                                </View>
                            </View>
                        )}

                        {/* 底部间距 */}
                        <View style={{ height: 40 }} />
                    </ScrollView>
                </>
            )}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#888',
        fontSize: 16,
    },

    // 空状态
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    emptyEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        color: '#eee',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    emptySubtext: {
        color: '#888',
        fontSize: 14,
        textAlign: 'center',
    },

    // 日期选择器
    dateSection: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#0f3460',
    },
    dateList: {
        paddingHorizontal: 16,
        gap: 8,
    },
    dateChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#16213e',
        marginRight: 8,
    },
    dateChipActive: {
        backgroundColor: '#f39c12',
    },
    dateChipText: {
        color: '#888',
        fontSize: 14,
        fontWeight: '500',
    },
    dateChipTextActive: {
        color: '#1a1a2e',
    },

    // 内容区
    content: {
        flex: 1,
        padding: 16,
    },

    // 汉字网格
    charGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    charItem: {
        aspectRatio: 1,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    charText: {
        fontSize: 32,
        color: '#fff',
        fontWeight: '600',
    },
    pinyinText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },

    // 无数据
    noDataContainer: {
        padding: 40,
        alignItems: 'center',
    },
    noDataText: {
        color: '#888',
        fontSize: 14,
    },

    // 图例
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
        marginTop: 24,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#0f3460',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    legendText: {
        color: '#888',
        fontSize: 12,
    },
});
