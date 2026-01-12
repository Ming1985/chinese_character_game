import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { TEXTBOOKS, getLevelsByTextbook, getCharactersByLevelId } from '../src/data';
import { getCompletedLevelIds } from '../src/lib/database';

export default function LevelsScreen() {
    const { textbookId } = useLocalSearchParams<{ textbookId: string }>();
    const [completedLevelIds, setCompletedLevelIds] = useState<string[]>([]);

    // 获取课本信息
    const textbook = TEXTBOOKS.find(t => t.id === textbookId);
    const levels = textbookId ? getLevelsByTextbook(textbookId) : [];

    // 加载已完成的关卡（每次页面获得焦点时刷新）
    useFocusEffect(
        useCallback(() => {
            getCompletedLevelIds().then(setCompletedLevelIds).catch(console.error);
        }, [])
    );

    const handleStartBattle = (levelId: string) => {
        router.push({ pathname: '/battle', params: { levelId } });
    };

    const handleViewCharacters = (levelId: string) => {
        router.push({ pathname: '/characters', params: { levelId } });
    };

    const handleStartLearning = (levelId: string) => {
        router.push({ pathname: '/learning', params: { levelId } });
    };

    if (!textbook) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Link href="/textbooks" style={styles.backButton}>
                        <Text style={styles.backButtonText}>← 返回</Text>
                    </Link>
                    <Text style={styles.title}>选择课程</Text>
                </View>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>请先选择课本</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Link href="/textbooks" asChild>
                    <TouchableOpacity style={styles.backButton}>
                        <Text style={styles.backButtonText}>← 返回</Text>
                    </TouchableOpacity>
                </Link>
                <Text style={styles.title}>{textbook.name}</Text>
            </View>

            <ScrollView style={styles.levelList} contentContainerStyle={styles.levelListContent}>
                {levels.map((level) => {
                    const chars = getCharactersByLevelId(level.id);
                    const isCompleted = completedLevelIds.includes(level.id);

                    return (
                        <View
                            key={level.id}
                            style={[
                                styles.levelCard,
                                isCompleted && styles.levelCardCompleted,
                            ]}
                        >
                            <View style={styles.levelInfo}>
                                <Text style={styles.levelName}>
                                    {level.name}
                                </Text>
                                <Text style={styles.levelDetail}>
                                    {chars.length}个生字
                                </Text>
                                <Text style={styles.charPreview} numberOfLines={1}>
                                    {chars.slice(0, 8).map(c => c.char).join(' ')}
                                    {chars.length > 8 ? ' ...' : ''}
                                </Text>
                            </View>
                            <View style={styles.levelActions}>
                                <TouchableOpacity
                                    style={styles.previewButton}
                                    onPress={() => handleViewCharacters(level.id)}
                                >
                                    <Text style={styles.previewButtonText}>预览</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.learnButton}
                                    onPress={() => handleStartLearning(level.id)}
                                >
                                    <Text style={styles.learnButtonText}>学习</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.playButton}
                                    onPress={() => handleStartBattle(level.id)}
                                >
                                    <Text style={styles.playButtonText}>闯关</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.v2Button}
                                    onPress={() => router.push({ pathname: '/battle-v2', params: { levelId: level.id } })}
                                >
                                    <Text style={styles.v2ButtonText}>V2</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                })}
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
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: '#666',
        fontSize: 16,
    },
    levelList: {
        flex: 1,
    },
    levelListContent: {
        padding: 16,
    },
    levelCard: {
        backgroundColor: '#16213e',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 2,
        borderColor: '#0f3460',
        marginBottom: 12,
    },
    levelCardCompleted: {
        borderColor: '#27ae60',
    },
    levelInfo: {
        flex: 1,
    },
    levelName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#eee',
    },
    levelDetail: {
        fontSize: 14,
        color: '#888',
        marginTop: 4,
    },
    charPreview: {
        fontSize: 16,
        color: '#f39c12',
        marginTop: 8,
    },
    levelActions: {
        flexDirection: 'row',
    },
    previewButton: {
        backgroundColor: '#0f3460',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginRight: 6,
    },
    previewButtonText: {
        color: '#aaa',
        fontSize: 14,
    },
    learnButton: {
        backgroundColor: '#9b59b6',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginRight: 6,
    },
    learnButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    playButton: {
        backgroundColor: '#27ae60',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    playButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    v2Button: {
        backgroundColor: '#e94560',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginLeft: 8,
    },
    v2ButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
});
