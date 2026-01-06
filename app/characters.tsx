import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCharactersByLevelId } from '../src/data';
import { Character } from '../src/types';

export default function CharactersScreen() {
    const { levelId } = useLocalSearchParams<{ levelId: string }>();

    // 获取关卡字符
    const characters = levelId ? getCharactersByLevelId(levelId) : [];
    // 从levelId解析名称，格式: g1-up-l1
    const levelName = levelId ? `第${levelId.split('-l')[1]}课` : '生字列表';

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>← 返回</Text>
                </TouchableOpacity>
                <Text style={styles.title}>{levelName}</Text>
            </View>

            <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
                {characters.map((char, index) => (
                    <CharacterCard key={char.id} character={char} index={index + 1} />
                ))}
            </ScrollView>

            {characters.length > 0 && (
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.startButton}
                        onPress={() => router.replace({ pathname: '/battle', params: { levelId } })}
                    >
                        <Text style={styles.startButtonText}>开始闯关</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

function CharacterCard({ character, index }: { character: Character; index: number }) {
    return (
        <View style={styles.card}>
            <View style={styles.cardLeft}>
                <Text style={styles.index}>{index}</Text>
                <Text style={styles.char}>{character.char}</Text>
            </View>
            <View style={styles.cardRight}>
                <Text style={styles.pinyin}>{character.pinyin}</Text>
                <Text style={styles.word}>{character.word}</Text>
                <Text style={styles.wordPinyin}>{character.wordPinyin}</Text>
            </View>
            <View style={styles.cardMeta}>
                <Text style={styles.strokeCount}>{character.strokeCount}画</Text>
            </View>
        </View>
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#eee',
        marginRight: 60,
    },
    list: {
        flex: 1,
    },
    listContent: {
        padding: 16,
        gap: 12,
    },
    card: {
        backgroundColor: '#16213e',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#0f3460',
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    index: {
        color: '#666',
        fontSize: 14,
        width: 20,
    },
    char: {
        fontSize: 40,
        color: '#f39c12',
        fontWeight: 'bold',
    },
    cardRight: {
        flex: 1,
        marginLeft: 16,
    },
    pinyin: {
        fontSize: 16,
        color: '#aaa',
    },
    word: {
        fontSize: 18,
        color: '#eee',
        marginTop: 4,
    },
    wordPinyin: {
        fontSize: 14,
        color: '#888',
        marginTop: 2,
    },
    cardMeta: {
        alignItems: 'flex-end',
    },
    strokeCount: {
        fontSize: 12,
        color: '#666',
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#0f3460',
    },
    startButton: {
        backgroundColor: '#27ae60',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    startButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
