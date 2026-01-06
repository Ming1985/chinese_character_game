import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TEXTBOOKS, getCharactersByTextbook } from '../src/data';

export default function TextbooksScreen() {
    const handleSelectTextbook = (textbookId: string) => {
        router.push({ pathname: '/levels', params: { textbookId } });
    };

    // 按年级分组
    const grade1Books = TEXTBOOKS.filter(t => t.grade === 1);
    const grade2Books = TEXTBOOKS.filter(t => t.grade === 2);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Link href="/" asChild>
                    <TouchableOpacity style={styles.backButton}>
                        <Text style={styles.backButtonText}>← 返回</Text>
                    </TouchableOpacity>
                </Link>
                <Text style={styles.title}>选择课本</Text>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                {/* 一年级 */}
                <View style={styles.gradeSection}>
                    <Text style={styles.gradeTitle}>一年级</Text>
                    <View style={styles.bookGrid}>
                        {grade1Books.map(book => {
                            const charCount = getCharactersByTextbook(book.id).length;
                            return (
                                <TouchableOpacity
                                    key={book.id}
                                    style={styles.bookCard}
                                    onPress={() => handleSelectTextbook(book.id)}
                                >
                                    <View style={styles.bookCover}>
                                        <Text style={styles.bookGrade}>一年级</Text>
                                        <Text style={styles.bookSemester}>
                                            {book.semester === 'up' ? '上册' : '下册'}
                                        </Text>
                                    </View>
                                    <Text style={styles.bookName}>{book.name}</Text>
                                    <Text style={styles.bookInfo}>
                                        {book.totalLessons}课 · {charCount}字
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* 二年级 */}
                <View style={styles.gradeSection}>
                    <Text style={styles.gradeTitle}>二年级</Text>
                    <View style={styles.bookGrid}>
                        {grade2Books.map(book => {
                            const charCount = getCharactersByTextbook(book.id).length;
                            return (
                                <TouchableOpacity
                                    key={book.id}
                                    style={styles.bookCard}
                                    onPress={() => handleSelectTextbook(book.id)}
                                >
                                    <View style={[styles.bookCover, styles.bookCoverGrade2]}>
                                        <Text style={styles.bookGrade}>二年级</Text>
                                        <Text style={styles.bookSemester}>
                                            {book.semester === 'up' ? '上册' : '下册'}
                                        </Text>
                                    </View>
                                    <Text style={styles.bookName}>{book.name}</Text>
                                    <Text style={styles.bookInfo}>
                                        {book.totalLessons}课 · {charCount}字
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
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
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    gradeSection: {
        marginBottom: 30,
    },
    gradeTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#f39c12',
        marginBottom: 16,
    },
    bookGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    bookCard: {
        width: '47%',
        backgroundColor: '#16213e',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#0f3460',
    },
    bookCover: {
        width: '100%',
        aspectRatio: 0.75,
        backgroundColor: '#27ae60',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    bookCoverGrade2: {
        backgroundColor: '#3498db',
    },
    bookGrade: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    bookSemester: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 4,
    },
    bookName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#eee',
        marginBottom: 4,
    },
    bookInfo: {
        fontSize: 12,
        color: '#888',
    },
});
