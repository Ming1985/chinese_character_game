import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

interface GameCard {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    route: string;
    available: boolean;
}

const GAMES: GameCard[] = [
    {
        id: 'similar-char',
        name: '形近字辨别',
        description: '区分长得像的字',
        icon: '🔍',
        color: '#9b59b6',
        route: '/similar-char-game',
        available: true,
    },
    {
        id: 'word-builder',
        name: '组词大师',
        description: '选字组成词语',
        icon: '📝',
        color: '#3498db',
        route: '/word-builder-game',
        available: false,
    },
    {
        id: 'pinyin-match',
        name: '拼音连连看',
        description: '配对汉字和拼音',
        icon: '🔗',
        color: '#27ae60',
        route: '/pinyin-match-game',
        available: false,
    },
    {
        id: 'multi-sound',
        name: '多音字挑战',
        description: '选择正确读音',
        icon: '🎵',
        color: '#e67e22',
        route: '/multi-sound-game',
        available: false,
    },
];

export default function MiniGamesScreen() {
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;
    const columns = isTablet ? 4 : 2;
    const gap = 16;
    const cardWidth = (width - 48 - gap * (columns - 1)) / columns;

    const handleGamePress = (game: GameCard) => {
        if (game.available) {
            router.push(game.route as any);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* 头部 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← 返回</Text>
                </TouchableOpacity>
                <Text style={styles.title}>小游戏</Text>
                <View style={styles.placeholder} />
            </View>

            {/* 游戏列表 */}
            <View style={styles.content}>
                <View style={[styles.gameGrid, { gap }]}>
                    {GAMES.map((game) => (
                        <TouchableOpacity
                            key={game.id}
                            style={[
                                styles.gameCard,
                                {
                                    width: cardWidth,
                                    backgroundColor: game.available ? game.color : '#333',
                                    opacity: game.available ? 1 : 0.5,
                                },
                            ]}
                            onPress={() => handleGamePress(game)}
                            disabled={!game.available}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.gameIcon}>{game.icon}</Text>
                            <Text style={styles.gameName}>{game.name}</Text>
                            <Text style={styles.gameDesc}>{game.description}</Text>
                            {!game.available && (
                                <View style={styles.comingSoonBadge}>
                                    <Text style={styles.comingSoonText}>敬请期待</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
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
    gameGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    gameCard: {
        aspectRatio: 1,
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    gameIcon: {
        fontSize: 48,
        marginBottom: 8,
    },
    gameName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    gameDesc: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        marginTop: 4,
    },
    comingSoonBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    comingSoonText: {
        fontSize: 10,
        color: '#fff',
    },
});
