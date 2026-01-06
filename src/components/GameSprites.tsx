import React from 'react';
import Svg, { Circle, Ellipse, Path, Rect, G, Defs, RadialGradient, Stop } from 'react-native-svg';

interface SpriteProps {
    size?: number;
    hp?: number;
    maxHp?: number;
}

// 小怪物（字妖）
export function MonsterSprite({ size = 60, hp = 2, maxHp = 2 }: SpriteProps) {
    const damaged = hp < maxHp;
    const bodyColor = damaged ? '#9b59b6' : '#8e44ad';

    return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
            {/* 身体 */}
            <Ellipse cx="50" cy="60" rx="35" ry="30" fill={bodyColor} />

            {/* 眼睛 */}
            <Circle cx="35" cy="50" r="12" fill="#fff" />
            <Circle cx="65" cy="50" r="12" fill="#fff" />
            <Circle cx={damaged ? "32" : "38"} cy="50" r="6" fill="#2c3e50" />
            <Circle cx={damaged ? "62" : "68"} cy="50" r="6" fill="#2c3e50" />

            {/* 眉毛（受伤时愤怒） */}
            {damaged && (
                <>
                    <Path d="M 25 40 L 45 45" stroke="#2c3e50" strokeWidth="3" />
                    <Path d="M 75 40 L 55 45" stroke="#2c3e50" strokeWidth="3" />
                </>
            )}

            {/* 嘴巴 */}
            <Path
                d={damaged ? "M 35 75 Q 50 65 65 75" : "M 35 70 Q 50 85 65 70"}
                stroke="#2c3e50"
                strokeWidth="3"
                fill="none"
            />

            {/* 角 */}
            <Path d="M 30 35 L 25 15 L 35 30" fill="#e74c3c" />
            <Path d="M 70 35 L 75 15 L 65 30" fill="#e74c3c" />

            {/* 小脚 */}
            <Ellipse cx="35" cy="88" rx="10" ry="8" fill={bodyColor} />
            <Ellipse cx="65" cy="88" rx="10" ry="8" fill={bodyColor} />
        </Svg>
    );
}

// Boss（大字妖）
export function BossSprite({ size = 100, hp = 3, maxHp = 3 }: SpriteProps) {
    const hpRatio = hp / maxHp;
    const angry = hpRatio < 0.5;
    const bodyColor = angry ? '#c0392b' : '#e74c3c';

    return (
        <Svg width={size} height={size} viewBox="0 0 120 120">
            <Defs>
                <RadialGradient id="bossGlow" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor={bodyColor} stopOpacity="1" />
                    <Stop offset="100%" stopColor="#2c3e50" stopOpacity="0.3" />
                </RadialGradient>
            </Defs>

            {/* 光环（愤怒时） */}
            {angry && (
                <Circle cx="60" cy="60" r="55" fill="url(#bossGlow)" opacity="0.5" />
            )}

            {/* 身体 */}
            <Ellipse cx="60" cy="65" rx="45" ry="40" fill={bodyColor} />

            {/* 眼睛 */}
            <Circle cx="40" cy="55" r="15" fill="#fff" />
            <Circle cx="80" cy="55" r="15" fill="#fff" />
            <Circle cx={angry ? "35" : "45"} cy="55" r="8" fill="#c0392b" />
            <Circle cx={angry ? "75" : "85"} cy="55" r="8" fill="#c0392b" />

            {/* 眉毛 */}
            <Path d="M 25 40 L 55 48" stroke="#2c3e50" strokeWidth="4" />
            <Path d="M 95 40 L 65 48" stroke="#2c3e50" strokeWidth="4" />

            {/* 嘴巴（露牙） */}
            <Path d="M 35 80 Q 60 95 85 80" fill="#2c3e50" />
            <Path d="M 42 80 L 48 90 L 54 80" fill="#fff" />
            <Path d="M 66 80 L 72 90 L 78 80" fill="#fff" />

            {/* 大角 */}
            <Path d="M 25 40 L 10 5 L 35 30" fill="#f39c12" />
            <Path d="M 95 40 L 110 5 L 85 30" fill="#f39c12" />

            {/* 小角 */}
            <Path d="M 45 30 L 45 10 L 55 25" fill="#f39c12" />
            <Path d="M 75 30 L 75 10 L 65 25" fill="#f39c12" />

            {/* 爪子 */}
            <Path d="M 15 90 Q 10 100 20 105" fill={bodyColor} />
            <Path d="M 105 90 Q 110 100 100 105" fill={bodyColor} />
        </Svg>
    );
}

// 火球（攻击特效）
export function FireballSprite({ size = 40 }: SpriteProps) {
    return (
        <Svg width={size} height={size} viewBox="0 0 60 60">
            <Defs>
                <RadialGradient id="fireGrad" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor="#fff" />
                    <Stop offset="30%" stopColor="#f39c12" />
                    <Stop offset="70%" stopColor="#e74c3c" />
                    <Stop offset="100%" stopColor="#c0392b" stopOpacity="0" />
                </RadialGradient>
            </Defs>

            {/* 火焰尾巴 */}
            <Path
                d="M 10 30 Q 20 20 30 30 Q 20 40 10 30"
                fill="#e74c3c"
                opacity="0.7"
            />
            <Path
                d="M 5 30 Q 15 15 25 30 Q 15 45 5 30"
                fill="#f39c12"
                opacity="0.5"
            />

            {/* 火球主体 */}
            <Circle cx="35" cy="30" r="20" fill="url(#fireGrad)" />

            {/* 高光 */}
            <Circle cx="40" cy="25" r="5" fill="#fff" opacity="0.8" />
        </Svg>
    );
}

// 勇士（小龙）
export function HeroSprite({ size = 60 }: SpriteProps) {
    return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
            {/* 身体 */}
            <Ellipse cx="50" cy="60" rx="30" ry="28" fill="#27ae60" />

            {/* 肚皮 */}
            <Ellipse cx="50" cy="68" rx="18" ry="16" fill="#a8e6cf" />

            {/* 眼睛 */}
            <Circle cx="38" cy="48" r="10" fill="#fff" />
            <Circle cx="62" cy="48" r="10" fill="#fff" />
            <Circle cx="40" cy="48" r="5" fill="#2c3e50" />
            <Circle cx="64" cy="48" r="5" fill="#2c3e50" />
            <Circle cx="42" cy="46" r="2" fill="#fff" />
            <Circle cx="66" cy="46" r="2" fill="#fff" />

            {/* 鼻孔 */}
            <Circle cx="45" cy="58" r="2" fill="#1e8449" />
            <Circle cx="55" cy="58" r="2" fill="#1e8449" />

            {/* 微笑 */}
            <Path d="M 40 68 Q 50 78 60 68" stroke="#1e8449" strokeWidth="2" fill="none" />

            {/* 小角 */}
            <Path d="M 35 32 L 30 15 L 40 28" fill="#f39c12" />
            <Path d="M 65 32 L 70 15 L 60 28" fill="#f39c12" />

            {/* 耳朵/翅膀 */}
            <Ellipse cx="20" cy="55" rx="8" ry="15" fill="#27ae60" />
            <Ellipse cx="80" cy="55" rx="8" ry="15" fill="#27ae60" />

            {/* 小脚 */}
            <Ellipse cx="38" cy="88" rx="8" ry="6" fill="#27ae60" />
            <Ellipse cx="62" cy="88" rx="8" ry="6" fill="#27ae60" />
        </Svg>
    );
}

// 击败标记
export function DefeatedMark({ size = 30 }: SpriteProps) {
    return (
        <Svg width={size} height={size} viewBox="0 0 50 50">
            <Circle cx="25" cy="25" r="22" fill="#27ae60" />
            <Path
                d="M 15 25 L 22 32 L 38 16"
                stroke="#fff"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
        </Svg>
    );
}
