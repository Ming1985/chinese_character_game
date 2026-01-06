// 学期
export type Semester = 'up' | 'down'; // 上册/下册

// 课本信息
export interface Textbook {
    id: string;             // 如 "g1-up", "g2-down"
    grade: number;          // 年级 1-6
    semester: Semester;     // 上/下册
    name: string;           // 显示名称，如 "一年级上册"
    totalLessons: number;   // 总课数
}

// 汉字数据结构
export interface Character {
    id: string;
    char: string;           // 汉字
    pinyin: string;         // 拼音
    word: string;           // 组词，如 "树林"
    wordPinyin: string;     // 词语拼音
    word2?: string;         // 第二个词语（用于第二次书写）
    word2Pinyin?: string;   // 第二个词语拼音
    hint: string;           // 提示
    grade: number;          // 年级
    semester: Semester;     // 学期
    lesson: number;         // 课次
    strokeCount: number;    // 笔画数
}

// 用户对某个字的学习记录
export interface CharacterProgress {
    charId: string;
    correctCount: number;       // 正确次数
    wrongCount: number;         // 错误次数
    lastPracticed: number;      // 上次练习时间戳
    nextReview: number;         // 下次复习时间戳（间隔重复算法）
    avgResponseTime: number;    // 平均反应时间（毫秒）
    difficulty: number;         // 难度系数 0-1
}

// 关卡数据
export interface Level {
    id: string;
    name: string;
    grade: number;
    semester: Semester;
    lesson: number;
    characterCount: number;     // 汉字数量
}

// 小怪物状态
export interface MonsterState {
    character: Character;
    hp: number;                 // 当前HP，满血为2
    maxHp: number;              // 最大HP
    defeated: boolean;          // 是否被击败
    wrongCount: number;         // 写错次数（用于统计易错字）
}

// 游戏阶段
export type GamePhase = 'monster' | 'boss' | 'victory' | 'defeat';

// 游戏状态
export interface GameState {
    phase: GamePhase;           // 当前阶段
    monsters: MonsterState[];   // 小怪物列表
    currentMonsterIndex: number; // 当前小怪物索引
    bossHp: number;             // Boss HP（等于小怪物数量，Boss战时为3）
    bossMaxHp: number;          // Boss最大HP
    lives: number;              // 玩家生命
    // Boss战阶段
    bossCharacters: Character[]; // Boss战的3个字
    bossCharIndex: number;      // 当前Boss战字索引
}

// 书写结果
export interface WritingResult {
    recognized: string;         // 识别出的字
    isCorrect: boolean;
    score: number;              // 0-100 字形评分（预留）
    strokeData: StrokePoint[][]; // 笔画数据
}

// 笔画点
export interface StrokePoint {
    x: number;
    y: number;
    pressure: number;
    timestamp: number;
}

// 游戏设置
export interface GameSettings {
    dailyGoal: number;          // 每日目标字数
    soundEnabled: boolean;
    hintLevel: 'full' | 'partial' | 'none';
}
