import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';
import { getRandomQuestions, shuffleOptions, SimilarCharQuestion } from '../src/data/similar-chars';
import { getAudioService } from '../src/lib/audioService';

type GameState = 'playing' | 'answered' | 'finished';

const TOTAL_QUESTIONS = 10;

export default function SimilarCharGameScreen() {
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;

    const [questions, setQuestions] = useState<SimilarCharQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [gameState, setGameState] = useState<GameState>('playing');

    // 初始化游戏
    useEffect(() => {
        startNewGame();
    }, []);

    // 当题目改变时打乱选项
    useEffect(() => {
        if (questions.length > 0 && currentIndex < questions.length) {
            setShuffledOptions(shuffleOptions(questions[currentIndex].options));
        }
    }, [questions, currentIndex]);

    const startNewGame = useCallback(() => {
        const newQuestions = getRandomQuestions(TOTAL_QUESTIONS);
        setQuestions(newQuestions);
        setCurrentIndex(0);
        setScore(0);
        setSelectedAnswer(null);
        setGameState('playing');
    }, []);

    const handleSelectOption = (option: string) => {
        if (gameState !== 'playing') return;

        setSelectedAnswer(option);
        setGameState('answered');

        const currentQuestion = questions[currentIndex];
        const isAnswerCorrect = option === currentQuestion.answer;

        if (isAnswerCorrect) {
            setScore((prev) => prev + 1);
        }

        // 构建朗读文本
        const correctWord = currentQuestion.sentence.replace('_', currentQuestion.answer);
        let speechText: string;

        if (isAnswerCorrect) {
            // 答对：朗读"答对了，xxx"
            speechText = `答对了，${correctWord}`;
        } else {
            // 答错：朗读"xxx，而不是xxx"
            const wrongWord = currentQuestion.sentence.replace('_', option);
            speechText = `${correctWord}，而不是${wrongWord}`;
        }

        try {
            getAudioService().speakWord(speechText);
        } catch (error) {
            console.warn('TTS not available:', error);
        }
    };

    const handleNext = () => {
        if (currentIndex + 1 >= questions.length) {
            setGameState('finished');
        } else {
            setCurrentIndex((prev) => prev + 1);
            setSelectedAnswer(null);
            setGameState('playing');
        }
    };

    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedAnswer === currentQuestion?.answer;

    // 渲染题目句子，将 _ 替换为空格样式
    const renderSentence = (sentence: string) => {
        const parts = sentence.split('_');
        return (
            <Text style={styles.sentence}>
                {parts[0]}
                <Text style={styles.blank}>（  ）</Text>
                {parts[1]}
            </Text>
        );
    };

    // 获取选项按钮样式
    const getOptionStyle = (option: string) => {
        if (gameState !== 'answered') {
            return styles.optionButton;
        }

        if (option === currentQuestion?.answer) {
            return [styles.optionButton, styles.optionCorrect];
        }

        if (option === selectedAnswer && !isCorrect) {
            return [styles.optionButton, styles.optionWrong];
        }

        return [styles.optionButton, styles.optionDisabled];
    };

    // 结束页面
    if (gameState === 'finished') {
        const percentage = Math.round((score / TOTAL_QUESTIONS) * 100);
        const emoji = percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '💪';

        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.finishedContainer}>
                    <Text style={styles.finishedEmoji}>{emoji}</Text>
                    <Text style={styles.finishedTitle}>游戏结束</Text>
                    <Text style={styles.finishedScore}>
                        {score}/{TOTAL_QUESTIONS}
                    </Text>
                    <Text style={styles.finishedSubtext}>
                        答对 {score} 题，正确率 {percentage}%
                    </Text>

                    <View style={styles.finishedButtons}>
                        <TouchableOpacity
                            style={[styles.finishedButton, styles.retryButton]}
                            onPress={startNewGame}
                        >
                            <Text style={styles.finishedButtonText}>再来一局</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.finishedButton, styles.homeButton]}
                            onPress={() => router.back()}
                        >
                            <Text style={styles.finishedButtonText}>返回</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    // 加载中
    if (!currentQuestion) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>加载中...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* 头部 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← 退出</Text>
                </TouchableOpacity>
                <Text style={styles.progress}>
                    第 {currentIndex + 1}/{TOTAL_QUESTIONS} 题
                </Text>
                <Text style={styles.scoreText}>得分: {score}</Text>
            </View>

            {/* 题目区域 */}
            <View style={styles.questionArea}>
                {renderSentence(currentQuestion.sentence)}
            </View>

            {/* 选项区域 */}
            <View style={[styles.optionsArea, isTablet && styles.optionsAreaTablet]}>
                {shuffledOptions.map((option, index) => (
                    <TouchableOpacity
                        key={`${currentQuestion.id}-${option}-${index}`}
                        style={getOptionStyle(option)}
                        onPress={() => handleSelectOption(option)}
                        disabled={gameState === 'answered'}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.optionText}>{option}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* 反馈区域 */}
            {gameState === 'answered' && (
                <View style={styles.feedbackArea}>
                    <View
                        style={[
                            styles.feedbackCard,
                            isCorrect ? styles.feedbackCorrect : styles.feedbackWrong,
                        ]}
                    >
                        <Text style={styles.feedbackTitle}>
                            {isCorrect ? '✓ 正确！' : '✗ 错误'}
                        </Text>
                        {!isCorrect && (
                            <Text style={styles.feedbackAnswer}>
                                正确答案：{currentQuestion.answer}
                            </Text>
                        )}
                        <Text style={styles.feedbackExplanation}>
                            {currentQuestion.explanation}
                        </Text>
                    </View>

                    <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                        <Text style={styles.nextButtonText}>
                            {currentIndex + 1 >= TOTAL_QUESTIONS ? '查看结果' : '下一题'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
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

    // 头部
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
    progress: {
        fontSize: 16,
        color: '#eee',
        fontWeight: '600',
    },
    scoreText: {
        fontSize: 14,
        color: '#27ae60',
        fontWeight: '600',
    },

    // 题目区域
    questionArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    sentence: {
        fontSize: 32,
        color: '#eee',
        textAlign: 'center',
        lineHeight: 48,
    },
    blank: {
        color: '#f39c12',
        fontWeight: 'bold',
    },

    // 选项区域
    optionsArea: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 16,
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    optionsAreaTablet: {
        gap: 24,
    },
    optionButton: {
        width: 80,
        height: 80,
        borderRadius: 16,
        backgroundColor: '#16213e',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#0f3460',
    },
    optionCorrect: {
        backgroundColor: '#27ae60',
        borderColor: '#27ae60',
    },
    optionWrong: {
        backgroundColor: '#e74c3c',
        borderColor: '#e74c3c',
    },
    optionDisabled: {
        opacity: 0.5,
    },
    optionText: {
        fontSize: 36,
        color: '#fff',
        fontWeight: 'bold',
    },

    // 反馈区域
    feedbackArea: {
        padding: 16,
        alignItems: 'center',
    },
    feedbackCard: {
        width: '100%',
        maxWidth: 400,
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
    },
    feedbackCorrect: {
        backgroundColor: 'rgba(39, 174, 96, 0.2)',
        borderWidth: 2,
        borderColor: '#27ae60',
    },
    feedbackWrong: {
        backgroundColor: 'rgba(231, 76, 60, 0.2)',
        borderWidth: 2,
        borderColor: '#e74c3c',
    },
    feedbackTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 8,
    },
    feedbackAnswer: {
        fontSize: 16,
        color: '#f39c12',
        textAlign: 'center',
        marginBottom: 8,
    },
    feedbackExplanation: {
        fontSize: 14,
        color: '#aaa',
        textAlign: 'center',
    },
    nextButton: {
        backgroundColor: '#9b59b6',
        paddingVertical: 14,
        paddingHorizontal: 48,
        borderRadius: 25,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },

    // 结束页面
    finishedContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    finishedEmoji: {
        fontSize: 80,
        marginBottom: 16,
    },
    finishedTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#eee',
        marginBottom: 16,
    },
    finishedScore: {
        fontSize: 64,
        fontWeight: 'bold',
        color: '#f39c12',
    },
    finishedSubtext: {
        fontSize: 16,
        color: '#888',
        marginTop: 8,
        marginBottom: 32,
    },
    finishedButtons: {
        flexDirection: 'row',
        gap: 16,
    },
    finishedButton: {
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 25,
    },
    retryButton: {
        backgroundColor: '#9b59b6',
    },
    homeButton: {
        backgroundColor: '#0f3460',
    },
    finishedButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
