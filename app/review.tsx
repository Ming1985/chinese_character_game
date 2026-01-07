import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getReviewCount, getCharactersDueForReview } from '../src/lib/database';

export default function ReviewScreen() {
    const [reviewCount, setReviewCount] = useState(0);
    const [reviewCharIds, setReviewCharIds] = useState<string[]>([]);

    // 每次页面获得焦点时刷新
    useFocusEffect(
        useCallback(() => {
            getReviewCount().then(setReviewCount).catch(console.error);
            getCharactersDueForReview(20).then(setReviewCharIds).catch(console.error);
        }, [])
    );

    const handleStartReview = () => {
        if (reviewCharIds.length > 0) {
            // 传递复习字ID列表到战斗页面
            router.push({ pathname: '/battle', params: { reviewMode: 'true', charIds: reviewCharIds.join(',') } });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Link href="/" style={styles.backButton}>
                    <Text style={styles.backButtonText}>← 返回</Text>
                </Link>
                <Text style={styles.title}>每日复习</Text>
            </View>

            <View style={styles.content}>
                {reviewCount > 0 ? (
                    <>
                        <Text style={styles.countText}>今日需复习</Text>
                        <Text style={styles.countNumber}>{reviewCount}</Text>
                        <Text style={styles.countUnit}>个汉字</Text>

                        <TouchableOpacity style={styles.startButton} onPress={handleStartReview}>
                            <Text style={styles.startButtonText}>开始复习</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>🎉</Text>
                        <Text style={styles.emptyText}>太棒了！</Text>
                        <Text style={styles.emptySubtext}>今日没有需要复习的汉字</Text>
                        <Text style={styles.emptyHint}>去冒险学习新字吧</Text>
                    </View>
                )}
            </View>
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
        flex: 1,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        color: '#eee',
        marginRight: 60,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    countText: {
        fontSize: 18,
        color: '#888',
    },
    countNumber: {
        fontSize: 80,
        fontWeight: 'bold',
        color: '#f39c12',
        marginVertical: 8,
    },
    countUnit: {
        fontSize: 18,
        color: '#888',
    },
    startButton: {
        backgroundColor: '#e94560',
        paddingVertical: 16,
        paddingHorizontal: 48,
        borderRadius: 12,
        marginTop: 40,
    },
    startButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
    },
    emptyEmoji: {
        fontSize: 80,
    },
    emptyText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#27ae60',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 16,
        color: '#888',
        marginTop: 8,
    },
    emptyHint: {
        fontSize: 14,
        color: '#555',
        marginTop: 24,
    },
});
