import { Character, Textbook, Level, Semester } from '../types';

// 导入各年级数据
import { GRADE1_UP_CHARACTERS } from './grade1-up';
import { GRADE1_DOWN_CHARACTERS } from './grade1-down';
import { GRADE2_UP_CHARACTERS, GRADE2_UP_LESSON_NAMES } from './grade2-up';
import { GRADE2_DOWN_CHARACTERS } from './grade2-down';

// 所有课本
export const TEXTBOOKS: Textbook[] = [
    { id: 'g1-up', grade: 1, semester: 'up', name: '一年级上册', totalLessons: 14 },
    { id: 'g1-down', grade: 1, semester: 'down', name: '一年级下册', totalLessons: 8 },
    { id: 'g2-up', grade: 2, semester: 'up', name: '二年级上册', totalLessons: 29 },
    { id: 'g2-down', grade: 2, semester: 'down', name: '二年级下册', totalLessons: 8 },
];

// 关卡名称映射（按课本）
const LESSON_NAMES: Record<string, Record<number, string>> = {
    'g2-up': GRADE2_UP_LESSON_NAMES,
};

// 所有汉字数据
const ALL_CHARACTERS: Character[] = [
    ...GRADE1_UP_CHARACTERS,
    ...GRADE1_DOWN_CHARACTERS,
    ...GRADE2_UP_CHARACTERS,
    ...GRADE2_DOWN_CHARACTERS,
];

// 根据课本获取所有汉字
export function getCharactersByTextbook(textbookId: string): Character[] {
    const textbook = TEXTBOOKS.find(t => t.id === textbookId);
    if (!textbook) return [];
    return ALL_CHARACTERS.filter(
        c => c.grade === textbook.grade && c.semester === textbook.semester
    );
}

// 根据课本和课次获取汉字
export function getCharactersByLesson(
    grade: number,
    semester: Semester,
    lesson: number
): Character[] {
    return ALL_CHARACTERS.filter(
        c => c.grade === grade && c.semester === semester && c.lesson === lesson
    );
}

// 获取关卡名称
function getLessonName(textbookId: string, lesson: number): string {
    const names = LESSON_NAMES[textbookId];
    if (names && names[lesson]) {
        return names[lesson];
    }
    return `第${lesson}课`;
}

// 获取课本的所有关卡
export function getLevelsByTextbook(textbookId: string): Level[] {
    const textbook = TEXTBOOKS.find(t => t.id === textbookId);
    if (!textbook) return [];

    const levels: Level[] = [];
    for (let lesson = 1; lesson <= textbook.totalLessons; lesson++) {
        const chars = getCharactersByLesson(textbook.grade, textbook.semester, lesson);
        if (chars.length > 0) {
            levels.push({
                id: `${textbookId}-l${lesson}`,
                name: getLessonName(textbookId, lesson),
                grade: textbook.grade,
                semester: textbook.semester,
                lesson,
                characterCount: chars.length,
            });
        }
    }
    return levels;
}

// 根据关卡ID获取汉字
export function getCharactersByLevelId(levelId: string): Character[] {
    // levelId 格式: "g1-up-l1"
    const match = levelId.match(/^(g\d+-(?:up|down))-l(\d+)$/);
    if (!match) return [];

    const textbookId = match[1];
    const lesson = parseInt(match[2]);
    const textbook = TEXTBOOKS.find(t => t.id === textbookId);
    if (!textbook) return [];

    return getCharactersByLesson(textbook.grade, textbook.semester, lesson);
}

// 根据ID获取单个汉字
export function getCharacterById(id: string): Character | undefined {
    return ALL_CHARACTERS.find(c => c.id === id);
}
