import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TEXTBOOKS, getCharactersByTextbook } from '../src/data';

export default function TextbooksScreen() {
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;

    const handleSelectTextbook = (textbookId: string) => {
        router.push({ pathname: '/levels', params: { textbookId } });
    };

    // 按年级分组
    const grade1Books = TEXTBOOKS.filter(t => t.grade === 1);
    const grade2Books = TEXTBOOKS.filter(t => t.grade === 2);

    // 响应式：iPad 显示 4 列，手机 2 列
    const columns = isTablet ? 4 : 2;
    const gap = isTablet ? 16 : 12;
    const cardWidth = (width - 40 - gap * (columns - 1)) / columns;

    const renderBookCard = (book: typeof TEXTBOOKS[0], colorScheme: 'green' | 'blue') => {
        const charCount = getCharactersByTextbook(book.id).length;
        const bgColor = colorScheme === 'green' ? '#27ae60' : '#3498db';
        const semesterLabel = book.semester === 'up' ? '上' : '下';

        return (
            <TouchableOpacity
                key={book.id}
                style={[
                    styles.bookCard,
                    {
                        width: cardWidth,
                        backgroundColor: bgColor,
                    },
                ]}
                onPress={() => handleSelectTextbook(book.id)}
                activeOpacity={0.8}
            >
                <Text style={styles.semesterBadge}>{semesterLabel}</Text>
                <Text style={styles.gradeName}>{book.grade}年级</Text>
                <Text style={styles.semesterName}>
                    {book.semester === 'up' ? '上册' : '下册'}
                </Text>
                <View style={styles.statsRow}>
                    <Text style={styles.statsText}>{charCount}字</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* 头部 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← 返回</Text>
                </TouchableOpacity>
                <Text style={styles.title}>选择课本</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={[styles.contentContainer, { gap }]}
                showsVerticalScrollIndicator={false}
            >
                {/* 一年级 */}
                <View style={styles.gradeSection}>
                    <Text style={styles.gradeTitle}>一年级</Text>
                    <View style={[styles.bookGrid, { gap }]}>
                        {grade1Books.map(book => renderBookCard(book, 'green'))}
                    </View>
                </View>

                {/* 二年级 */}
                <View style={styles.gradeSection}>
                    <Text style={styles.gradeTitle}>二年级</Text>
                    <View style={[styles.bookGrid, { gap }]}>
                        {grade2Books.map(book => renderBookCard(book, 'blue'))}
                    </View>
                </View>

                {/* 底部间距 */}
                <View style={{ height: 20 }} />
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
    },
    contentContainer: {
        padding: 20,
    },
    gradeSection: {
        marginBottom: 8,
    },
    gradeTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#888',
        marginBottom: 12,
        marginLeft: 4,
    },
    bookGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    bookCard: {
        aspectRatio: 1,
        borderRadius: 16,
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    semesterBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
        overflow: 'hidden',
    },
    gradeName: {
        fontSize: 18,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.9)',
    },
    semesterName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 4,
    },
    statsRow: {
        marginTop: 12,
        backgroundColor: 'rgba(0,0,0,0.15)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 10,
    },
    statsText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.85)',
        fontWeight: '500',
    },
});
