import * as SQLite from 'expo-sqlite';
import { CharacterProgress } from '../types';

const DB_NAME = 'hanzi_game.db';

let db: SQLite.SQLiteDatabase | null = null;

// 获取数据库实例
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (db) return db;
    db = await SQLite.openDatabaseAsync(DB_NAME);
    await initDatabase(db);
    return db;
}

// 初始化数据库表
async function initDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
    await database.execAsync(`
        CREATE TABLE IF NOT EXISTS character_progress (
            char_id TEXT PRIMARY KEY,
            correct_count INTEGER DEFAULT 0,
            wrong_count INTEGER DEFAULT 0,
            last_practiced INTEGER DEFAULT 0,
            next_review INTEGER DEFAULT 0,
            avg_response_time REAL DEFAULT 0,
            difficulty REAL DEFAULT 0.5
        );

        CREATE TABLE IF NOT EXISTS level_completion (
            level_id TEXT PRIMARY KEY,
            completed_at INTEGER,
            stars INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS daily_stats (
            date TEXT PRIMARY KEY,
            chars_practiced INTEGER DEFAULT 0,
            correct_count INTEGER DEFAULT 0,
            wrong_count INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS app_settings (
            key TEXT PRIMARY KEY,
            value TEXT
        );
    `);
}

// 获取某个字的学习进度
export async function getCharacterProgress(charId: string): Promise<CharacterProgress | null> {
    const database = await getDatabase();
    const result = await database.getFirstAsync<{
        char_id: string;
        correct_count: number;
        wrong_count: number;
        last_practiced: number;
        next_review: number;
        avg_response_time: number;
        difficulty: number;
    }>('SELECT * FROM character_progress WHERE char_id = ?', [charId]);

    if (!result) return null;

    return {
        charId: result.char_id,
        correctCount: result.correct_count,
        wrongCount: result.wrong_count,
        lastPracticed: result.last_practiced,
        nextReview: result.next_review,
        avgResponseTime: result.avg_response_time,
        difficulty: result.difficulty,
    };
}

// 保存答题结果
export async function saveAnswerResult(
    charId: string,
    isCorrect: boolean,
    responseTime: number
): Promise<void> {
    const database = await getDatabase();
    const now = Date.now();
    const today = new Date().toISOString().split('T')[0];

    // 获取现有进度
    const existing = await getCharacterProgress(charId);

    if (existing) {
        // 更新现有记录
        const newCorrect = existing.correctCount + (isCorrect ? 1 : 0);
        const newWrong = existing.wrongCount + (isCorrect ? 0 : 1);
        const totalAttempts = newCorrect + newWrong;
        const newAvgTime = (existing.avgResponseTime * (totalAttempts - 1) + responseTime) / totalAttempts;

        // 计算新难度（基于正确率，错误越多难度越高）
        const accuracy = newCorrect / totalAttempts;
        const newDifficulty = 1 - accuracy;

        // 计算下次复习时间（简单的间隔重复：正确则间隔加倍，错误则重置）
        const baseInterval = 24 * 60 * 60 * 1000; // 1天
        const multiplier = isCorrect ? Math.pow(2, newCorrect) : 1;
        const nextReview = now + baseInterval * Math.min(multiplier, 30); // 最多30天

        await database.runAsync(
            `UPDATE character_progress SET
                correct_count = ?,
                wrong_count = ?,
                last_practiced = ?,
                next_review = ?,
                avg_response_time = ?,
                difficulty = ?
            WHERE char_id = ?`,
            [newCorrect, newWrong, now, nextReview, newAvgTime, newDifficulty, charId]
        );
    } else {
        // 创建新记录
        const nextReview = now + (isCorrect ? 2 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000);
        await database.runAsync(
            `INSERT INTO character_progress (char_id, correct_count, wrong_count, last_practiced, next_review, avg_response_time, difficulty)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [charId, isCorrect ? 1 : 0, isCorrect ? 0 : 1, now, nextReview, responseTime, isCorrect ? 0.3 : 0.7]
        );
    }

    // 更新每日统计
    await database.runAsync(
        `INSERT INTO daily_stats (date, chars_practiced, correct_count, wrong_count)
        VALUES (?, 1, ?, ?)
        ON CONFLICT(date) DO UPDATE SET
            chars_practiced = chars_practiced + 1,
            correct_count = correct_count + ?,
            wrong_count = wrong_count + ?`,
        [today, isCorrect ? 1 : 0, isCorrect ? 0 : 1, isCorrect ? 1 : 0, isCorrect ? 0 : 1]
    );
}

// 标记关卡完成
export async function markLevelCompleted(levelId: string, stars: number = 3): Promise<void> {
    const database = await getDatabase();
    const now = Date.now();

    await database.runAsync(
        `INSERT INTO level_completion (level_id, completed_at, stars)
        VALUES (?, ?, ?)
        ON CONFLICT(level_id) DO UPDATE SET
            completed_at = ?,
            stars = MAX(stars, ?)`,
        [levelId, now, stars, now, stars]
    );
}

// 检查关卡是否完成
export async function isLevelCompleted(levelId: string): Promise<boolean> {
    const database = await getDatabase();
    const result = await database.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM level_completion WHERE level_id = ?',
        [levelId]
    );
    return (result?.count ?? 0) > 0;
}

// 获取已完成的关卡ID列表
export async function getCompletedLevelIds(): Promise<string[]> {
    const database = await getDatabase();
    const results = await database.getAllAsync<{ level_id: string }>(
        'SELECT level_id FROM level_completion'
    );
    return results.map(r => r.level_id);
}

// 获取需要复习的字（next_review 小于当前时间）
export async function getCharactersDueForReview(limit: number = 20): Promise<string[]> {
    const database = await getDatabase();
    const now = Date.now();

    const results = await database.getAllAsync<{ char_id: string }>(
        `SELECT char_id FROM character_progress
        WHERE next_review <= ?
        ORDER BY next_review ASC
        LIMIT ?`,
        [now, limit]
    );

    return results.map(r => r.char_id);
}

// 获取需要复习的字数量
export async function getReviewCount(): Promise<number> {
    const database = await getDatabase();
    const now = Date.now();

    const result = await database.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM character_progress WHERE next_review <= ?',
        [now]
    );

    return result?.count ?? 0;
}

// 获取今日练习数
export async function getTodayPracticeCount(): Promise<number> {
    const database = await getDatabase();
    const today = new Date().toISOString().split('T')[0];

    const result = await database.getFirstAsync<{ chars_practiced: number }>(
        'SELECT chars_practiced FROM daily_stats WHERE date = ?',
        [today]
    );

    return result?.chars_practiced ?? 0;
}

// 获取今日统计
export async function getTodayStats(): Promise<{ practiced: number; correct: number; wrong: number }> {
    const database = await getDatabase();
    const today = new Date().toISOString().split('T')[0];

    const result = await database.getFirstAsync<{
        chars_practiced: number;
        correct_count: number;
        wrong_count: number;
    }>('SELECT * FROM daily_stats WHERE date = ?', [today]);

    return {
        practiced: result?.chars_practiced ?? 0,
        correct: result?.correct_count ?? 0,
        wrong: result?.wrong_count ?? 0,
    };
}

// 获取某关卡所有字的进度
export async function getLevelProgress(charIds: string[]): Promise<Map<string, CharacterProgress>> {
    const database = await getDatabase();
    const placeholders = charIds.map(() => '?').join(',');

    const results = await database.getAllAsync<{
        char_id: string;
        correct_count: number;
        wrong_count: number;
        last_practiced: number;
        next_review: number;
        avg_response_time: number;
        difficulty: number;
    }>(`SELECT * FROM character_progress WHERE char_id IN (${placeholders})`, charIds);

    const progressMap = new Map<string, CharacterProgress>();
    for (const row of results) {
        progressMap.set(row.char_id, {
            charId: row.char_id,
            correctCount: row.correct_count,
            wrongCount: row.wrong_count,
            lastPracticed: row.last_practiced,
            nextReview: row.next_review,
            avgResponseTime: row.avg_response_time,
            difficulty: row.difficulty,
        });
    }

    return progressMap;
}

// ============ 设置存储 ============

// 保存设置
export async function saveSetting(key: string, value: string): Promise<void> {
    const database = await getDatabase();
    await database.runAsync(
        `INSERT INTO app_settings (key, value) VALUES (?, ?)
         ON CONFLICT(key) DO UPDATE SET value = ?`,
        [key, value, value]
    );
}

// 读取单个设置
export async function getSetting(key: string): Promise<string | null> {
    const database = await getDatabase();
    const result = await database.getFirstAsync<{ value: string }>(
        'SELECT value FROM app_settings WHERE key = ?',
        [key]
    );
    return result?.value ?? null;
}

// 读取所有设置
export async function getAllSettings(): Promise<Record<string, string>> {
    const database = await getDatabase();
    const results = await database.getAllAsync<{ key: string; value: string }>(
        'SELECT * FROM app_settings'
    );
    return Object.fromEntries(results.map(r => [r.key, r.value]));
}

// ============ 学习报告统计 ============

// 获取总体统计
export async function getOverallStats(): Promise<{
    totalPracticed: number;
    totalCorrect: number;
    totalWrong: number;
    accuracy: number;
}> {
    const database = await getDatabase();
    const result = await database.getFirstAsync<{
        total_correct: number;
        total_wrong: number;
    }>(`
        SELECT 
            COALESCE(SUM(correct_count), 0) as total_correct,
            COALESCE(SUM(wrong_count), 0) as total_wrong
        FROM character_progress
    `);

    const totalCorrect = result?.total_correct ?? 0;
    const totalWrong = result?.total_wrong ?? 0;
    const totalPracticed = totalCorrect + totalWrong;
    const accuracy = totalPracticed > 0 ? totalCorrect / totalPracticed : 0;

    return { totalPracticed, totalCorrect, totalWrong, accuracy };
}

// 获取近7天每日统计
export async function getWeeklyStats(): Promise<Array<{
    date: string;
    practiced: number;
    correct: number;
    wrong: number;
}>> {
    const database = await getDatabase();
    
    // 生成近7天日期列表
    const dates: string[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
    }

    const results = await database.getAllAsync<{
        date: string;
        chars_practiced: number;
        correct_count: number;
        wrong_count: number;
    }>(`
        SELECT date, chars_practiced, correct_count, wrong_count 
        FROM daily_stats 
        WHERE date >= ?
        ORDER BY date ASC
    `, [dates[0]]);

    // 将结果映射到日期数组
    const statsMap = new Map(results.map(r => [r.date, r]));
    
    return dates.map(date => {
        const stat = statsMap.get(date);
        return {
            date,
            practiced: stat?.chars_practiced ?? 0,
            correct: stat?.correct_count ?? 0,
            wrong: stat?.wrong_count ?? 0,
        };
    });
}

// 获取最难的字（错误率最高）
export async function getDifficultCharacters(limit: number = 5): Promise<Array<{
    charId: string;
    correctCount: number;
    wrongCount: number;
    difficulty: number;
}>> {
    const database = await getDatabase();
    const results = await database.getAllAsync<{
        char_id: string;
        correct_count: number;
        wrong_count: number;
        difficulty: number;
    }>(`
        SELECT char_id, correct_count, wrong_count, difficulty
        FROM character_progress
        WHERE wrong_count > 0
        ORDER BY difficulty DESC, wrong_count DESC
        LIMIT ?
    `, [limit]);

    return results.map(r => ({
        charId: r.char_id,
        correctCount: r.correct_count,
        wrongCount: r.wrong_count,
        difficulty: r.difficulty,
    }));
}

// 获取已掌握的字数（difficulty < 0.3）
export async function getMasteredCount(): Promise<number> {
    const database = await getDatabase();
    const result = await database.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM character_progress WHERE difficulty < 0.3'
    );
    return result?.count ?? 0;
}
