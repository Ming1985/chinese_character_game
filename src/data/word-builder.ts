// 组词大师游戏数据
import { GRADE1_UP_CHARACTERS } from './grade1-up';
import { GRADE1_DOWN_CHARACTERS } from './grade1-down';
import { GRADE2_UP_CHARACTERS } from './grade2-up';
import { GRADE2_DOWN_CHARACTERS } from './grade2-down';
import { Character } from '../types';

export interface WordAnswer {
    char: string;            // 正确答案字
    word: string;            // 完整词语
    wordPinyin: string;      // 词语拼音
    position: 'before' | 'after';  // 答案在目标字前还是后
}

export interface WordBuilderQuestion {
    id: string;
    targetChar: string;      // 目标字
    targetPinyin: string;    // 目标字拼音
    answers: WordAnswer[];   // 2个正确答案
    options: string[];       // 6个选项（含2个正确答案）
}

// 收集所有字符
const ALL_CHARACTERS: Character[] = [
    ...GRADE1_UP_CHARACTERS,
    ...GRADE1_DOWN_CHARACTERS,
    ...GRADE2_UP_CHARACTERS,
    ...GRADE2_DOWN_CHARACTERS,
];

// 提取所有唯一的汉字（用于生成干扰项）
const ALL_CHARS = [...new Set(ALL_CHARACTERS.map(c => c.char))];

// 从词语中提取另一个字
function getOtherChar(word: string, targetChar: string): { char: string; position: 'before' | 'after' } | null {
    if (word.length !== 2) return null;

    if (word[0] === targetChar) {
        return { char: word[1], position: 'after' };
    } else if (word[1] === targetChar) {
        return { char: word[0], position: 'before' };
    }
    return null;
}

// 生成干扰项
function generateDistractors(excludeChars: string[], count: number): string[] {
    const distractors: string[] = [];
    const usedChars = new Set(excludeChars);

    // 随机选择干扰项
    const shuffled = [...ALL_CHARS].sort(() => Math.random() - 0.5);

    for (const char of shuffled) {
        if (distractors.length >= count) break;
        if (!usedChars.has(char)) {
            distractors.push(char);
            usedChars.add(char);
        }
    }

    return distractors;
}

// 生成题目（每题2个正确答案，6个选项）
function generateQuestions(): WordBuilderQuestion[] {
    const questions: WordBuilderQuestion[] = [];
    let idCounter = 1;

    for (const char of ALL_CHARACTERS) {
        // 需要同时有 word 和 word2 才能生成题目
        if (!char.word || !char.word2 || char.word.length !== 2 || char.word2.length !== 2) {
            continue;
        }

        const result1 = getOtherChar(char.word, char.char);
        const result2 = getOtherChar(char.word2, char.char);

        if (!result1 || !result2) continue;

        // 确保两个答案不同
        if (result1.char === result2.char) continue;

        const answers: WordAnswer[] = [
            {
                char: result1.char,
                word: char.word,
                wordPinyin: char.wordPinyin,
                position: result1.position,
            },
            {
                char: result2.char,
                word: char.word2,
                wordPinyin: char.word2Pinyin || '',
                position: result2.position,
            },
        ];

        // 生成4个干扰项
        const distractors = generateDistractors([char.char, result1.char, result2.char], 4);
        const options = [result1.char, result2.char, ...distractors].sort(() => Math.random() - 0.5);

        questions.push({
            id: `wb-${idCounter++}`,
            targetChar: char.char,
            targetPinyin: char.pinyin,
            answers,
            options,
        });
    }

    return questions;
}

// 预生成题库
export const WORD_BUILDER_QUESTIONS = generateQuestions();

// 获取随机题目
export function getRandomWordBuilderQuestions(count: number): WordBuilderQuestion[] {
    const shuffled = [...WORD_BUILDER_QUESTIONS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(q => ({
        ...q,
        // 每次重新打乱选项顺序
        options: [...q.options].sort(() => Math.random() - 0.5),
    }));
}

