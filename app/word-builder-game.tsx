import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';
import { getRandomWordBuilderQuestions, WordBuilderQuestion } from '../src/data/word-builder';
import { getAudioService } from '../src/lib/audioService';

type GameState = 'playing' | 'answered' | 'finished';

const TOTAL_QUESTIONS = 10;
const REQUIRED_CORRECT = 2;  // 需要选中2个正确答案

export default function WordBuilderGameScreen() {
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;

    const [questions, setQuestions] = useState<WordBuilderQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
    const [score, setScore] = useState(0);
    const [gameState, setGameState] = useState<GameState>('playing');

    // 初始化游戏
    useEffect(() => {
        startNewGame();
    }, []);

    const startNewGame = useCallback(() => {
        const newQuestions = getRandomWordBuilderQuestions(TOTAL_QUESTIONS);
        setQuestions(newQuestions);
        setCurrentIndex(0);
        setScore(0);
        setSelectedAnswers([]);
        setGameState('playing');
    }, []);

    const currentQuestion = questions[currentIndex];
    const correctChars = currentQuestion?.answers.map(a => a.char) || [];

    const handleSelectOption = (option: string) => {
        if (gameState !== 'playing') return;
        if (selectedAnswers.includes(option)) return;  // 已选过

        const newSelected = [...selectedAnswers, option];
        setSelectedAnswers(newSelected);

        // 选满2个后判定
        if (newSelected.length === REQUIRED_CORRECT) {
            setGameState('answered');

            // 计算正确数
            const correctCount = newSelected.filter(s => correctChars.includes(s)).length;
            const isAllCorrect = correctCount === REQUIRED_CORRECT;

            if (isAllCorrect) {
                setScore((prev) => prev + 1);
            }

            // 构建朗读文本
            const words = currentQuestion.answers.map(a => a.word).join('，');
            let speechText: string;
            if (isAllCorrect) {
                speechText = `答对了，${words}`;
            } else if (correctCount === 1) {
                speechText = `答对一半，${words}`;
            } else {
                speechText = `错了，${words}`;
            }

            try {
                getAudioService().speakWord(speechText);
            } catch (error) {
                console.warn('TTS not available:', error);
            }
        }
    };

    const handleNext = () => {
        if (currentIndex + 1 >= questions.length) {
            setGameState('finished');
        } else {
            setCurrentIndex((prev) => prev + 1);
            setSelectedAnswers([]);
            setGameState('playing');
        }
    };

    // 计算本题正确数
    const correctCount = selectedAnswers.filter(s => correctChars.includes(s)).length;
    const isAllCorrect = correctCount === REQUIRED_CORRECT;

    // 获取选项按钮样式
    const getOptionStyle = (option: string) => {
        const isSelected = selectedAnswers.includes(option);
        const isCorrectOption = correctChars.includes(option);

        if (gameState !== 'answered') {
            // 游戏进行中
            if (isSelected) {
                return [styles.optionButton, styles.optionSelected];
            }
            return styles.optionButton;
        }

        // 答题后显示结果
        if (isCorrectOption) {
            return [styles.optionButton, styles.optionCorrect];
        }
        if (isSelected && !isCorrectOption) {
            return [styles.optionButton, styles.optionWrong];
        }
        return [styles.optionButton, styles.optionDisabled];
    };

    // 获取反馈标题
    function getFeedbackTitle(): string {
        if (isAllCorrect) return '✓ 全对！';
        if (correctCount === 1) return '△ 对了一半';
        return '✗ 错误';
    }

    // 获取反馈样式
    function getFeedbackStyle() {
        if (isAllCorrect) return styles.feedbackCorrect;
        if (correctCount === 1) return styles.feedbackPartial;
        return styles.feedbackWrong;
    }

    // 渲染题目
    const renderQuestion = () => {
        if (!currentQuestion) return null;

        return (
            <View style={styles.questionDisplay}>
                <Text style={styles.questionLabel}>选出2个能组词的字</Text>
                <Text style={styles.targetChar}>{currentQuestion.targetChar}</Text>
                <Text style={styles.pinyinHint}>{currentQuestion.targetPinyin}</Text>
                <Text style={styles.selectHint}>
                    已选 {selectedAnswers.length}/{REQUIRED_CORRECT}
                </Text>
            </View>
        );
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
                        全对 {score} 题，正确率 {percentage}%
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
                {renderQuestion()}
            </View>

            {/* 选项区域 - 6个选项 */}
            <View style={[styles.optionsArea, isTablet && styles.optionsAreaTablet]}>
                {currentQuestion.options.map((option, index) => (
                    <TouchableOpacity
                        key={`${currentQuestion.id}-${option}-${index}`}
                        style={getOptionStyle(option)}
                        onPress={() => handleSelectOption(option)}
                        disabled={gameState === 'answered' || selectedAnswers.length >= REQUIRED_CORRECT}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.optionText}>{option}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* 反馈区域 */}
            {gameState === 'answered' && (
                <View style={styles.feedbackArea}>
                    <View style={[styles.feedbackCard, getFeedbackStyle()]}>
                        <Text style={styles.feedbackTitle}>{getFeedbackTitle()}</Text>
                        <View style={styles.wordsContainer}>
                            {currentQuestion.answers.map((answer, idx) => (
                                <View key={idx} style={styles.wordItem}>
                                    <Text style={styles.feedbackWord}>{answer.word}</Text>
                                    <Text style={styles.feedbackPinyin}>{answer.wordPinyin}</Text>
                                </View>
                            ))}
                        </View>
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
    questionDisplay: {
        alignItems: 'center',
    },
    questionLabel: {
        fontSize: 18,
        color: '#888',
        marginBottom: 24,
    },
    targetChar: {
        fontSize: 80,
        color: '#eee',
        fontWeight: 'bold',
    },
    pinyinHint: {
        fontSize: 20,
        color: '#888',
        marginTop: 8,
    },
    selectHint: {
        fontSize: 16,
        color: '#3498db',
        marginTop: 16,
    },

    // 选项区域 - 6个选项 (3x2)
    optionsArea: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    optionsAreaTablet: {
        gap: 20,
    },
    optionButton: {
        width: 72,
        height: 72,
        borderRadius: 16,
        backgroundColor: '#16213e',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#0f3460',
    },
    optionSelected: {
        backgroundColor: '#2c3e50',
        borderColor: '#3498db',
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
        fontSize: 32,
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
        alignItems: 'center',
    },
    feedbackCorrect: {
        backgroundColor: 'rgba(39, 174, 96, 0.2)',
        borderWidth: 2,
        borderColor: '#27ae60',
    },
    feedbackPartial: {
        backgroundColor: 'rgba(241, 196, 15, 0.2)',
        borderWidth: 2,
        borderColor: '#f1c40f',
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
        marginBottom: 12,
    },
    wordsContainer: {
        flexDirection: 'row',
        gap: 24,
    },
    wordItem: {
        alignItems: 'center',
    },
    feedbackWord: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#f39c12',
        marginBottom: 4,
    },
    feedbackPinyin: {
        fontSize: 14,
        color: '#aaa',
    },
    nextButton: {
        backgroundColor: '#3498db',
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
        backgroundColor: '#3498db',
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
