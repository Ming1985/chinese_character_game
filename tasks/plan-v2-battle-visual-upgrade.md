# Implementation Plan: V2 战斗系统视觉升级

基于 PRD: `tasks/prd-v2-battle-visual-upgrade.md`

---

## 当前状态分析

### 现有布局参数 (`app/battle-v2.tsx`)
```typescript
// 游戏区域比例
gameArea: flex 0.55 (竖屏) / 0.35 (横屏)
bottomUI: flex 0.45 (竖屏) / 0.65 (横屏)

// 英雄位置
left: width * 0.05
top: isLandscape ? 20 : height * 0.15

// 怪物位置
left: interpolate(width * 0.75 → width * 0.15)  // 移动轨迹
top: isLandscape ? 10 : height * 0.1

// 精灵尺寸
heroSize: isLandscape ? 100 : 150
spriteSize: isLandscape ? 80 : 120
```

### 问题
1. 竖屏时英雄在 `height * 0.15` 可能被游戏区域切断
2. 怪物移动轨迹终点 `width * 0.15` 与英雄位置 `width * 0.05` 不对齐
3. 缺少攻击动画反馈

---

## Step 1: 调整战斗区域布局 (US-001)

### 修改文件
- `app/battle-v2.tsx`

### 具体改动

#### 1.1 调整游戏区域比例
```typescript
// 修改前
gameArea: flex: 0.55
gameAreaLandscape: flex: 0.35

// 修改后 - 给角色更多展示空间
gameArea: flex: 0.45  // 减少游戏区高度
bottomUI: flex: 0.55  // 增加底部区高度
```

#### 1.2 重新计算英雄位置
```typescript
// 修改前
{ left: width * 0.05, top: isLandscape ? 20 : height * 0.15 }

// 修改后 - 竖屏时固定在游戏区底部
const heroTop = isLandscape ? 20 : Math.min(height * 0.35 - heroSize, 200);
{ left: width * 0.08, top: heroTop }
```

#### 1.3 调整怪物位置和移动轨迹
```typescript
// 修改前
top: isLandscape ? 10 : height * 0.1
outputRange: [width * 0.75, width * 0.15]

// 修改后 - 怪物在右上角，移动到英雄附近
const monsterTop = isLandscape ? 10 : Math.min(height * 0.08, 80);
outputRange: [width * 0.7, width * 0.2]  // 终点与英雄位置对齐
```

#### 1.4 新增布局辅助计算
```typescript
// 在组件内添加布局计算
const gameAreaHeight = isLandscape ? height * 0.35 : height * 0.45;
const heroPosition = {
    x: width * 0.08,
    y: isLandscape ? 20 : gameAreaHeight - heroSize - 20,
};
const monsterStartPosition = {
    x: width * 0.7,
    y: isLandscape ? 10 : Math.min(height * 0.08, 80),
};
```

---

## Step 2: 创建火球精灵图片 (US-002)

### 使用 jiekou.ai API 生成

#### Prompt
```
A cute cartoon fireball for childrens educational game.
Round orange-yellow flame with a friendly face, big sparkly eyes,
small happy smile. Kawaii chibi style, warm glowing colors.
Transparent PNG background, game sprite style, 128x128 pixels.
High quality digital art, clean lines. No text or watermark.
```

#### 输出
- `assets/images/fireball.png` (128x128 或 256x256)

---

## Step 3: 实现火球飞行动画 (US-003)

### 修改文件
- `app/battle-v2.tsx`

### 3.1 添加状态和动画值
```typescript
// 新增状态
const [isAttacking, setIsAttacking] = useState(false);

// 新增动画值
const fireballX = useRef(new Animated.Value(0)).current;
const fireballY = useRef(new Animated.Value(0)).current;
const fireballOpacity = useRef(new Animated.Value(0)).current;
```

### 3.2 创建火球动画函数
```typescript
const playFireballAnimation = (onComplete: () => void) => {
    // 计算起点（英雄中心）和终点（怪物中心）
    const startX = heroPosition.x + heroSize / 2;
    const startY = heroPosition.y + heroSize / 2;

    // 获取当前怪物位置
    let currentMonsterX = 0;
    monsterProgress.addListener(({ value }) => {
        currentMonsterX = width * 0.7 - value * (width * 0.5);
    });
    const endX = currentMonsterX + spriteSize / 2;
    const endY = monsterStartPosition.y + spriteSize / 2;

    // 设置起点
    fireballX.setValue(startX);
    fireballY.setValue(startY);
    fireballOpacity.setValue(1);

    setIsAttacking(true);

    // 执行飞行动画
    Animated.parallel([
        Animated.timing(fireballX, {
            toValue: endX,
            duration: 600,
            useNativeDriver: true,
            easing: Easing.out(Easing.quad),
        }),
        Animated.timing(fireballY, {
            toValue: endY,
            duration: 600,
            useNativeDriver: true,
            easing: Easing.out(Easing.quad),
        }),
    ]).start(() => {
        // 动画完成，隐藏火球
        fireballOpacity.setValue(0);
        setIsAttacking(false);
        onComplete();
    });
};
```

### 3.3 修改 handleWritingComplete
```typescript
if (isCorrect && recognizedChar === targetChar) {
    monsterProgress.stopAnimation();
    setIsMoving(false);
    setWritingEnabled(false);

    // 播放火球动画，完成后再处理伤害
    playFireballAnimation(() => {
        const newHp = currentMonster.hp - 1;
        // ... 原有伤害逻辑
    });
}
```

### 3.4 添加火球渲染
```typescript
{/* 火球动画 */}
{isAttacking && (
    <Animated.Image
        source={require('../assets/images/fireball.png')}
        style={[
            styles.fireball,
            {
                transform: [
                    { translateX: fireballX },
                    { translateY: fireballY },
                ],
                opacity: fireballOpacity,
            },
        ]}
        resizeMode="contain"
    />
)}
```

### 3.5 添加样式
```typescript
fireball: {
    position: 'absolute',
    width: 60,
    height: 60,
    zIndex: 100,
},
```

---

## Step 4: 火球命中效果 (US-004)

### 4.1 命中时播放音效
在 `playFireballAnimation` 的 `onComplete` 回调中：
```typescript
.start(() => {
    // 命中音效
    getAudioService().playSoundEffect(SoundEffect.HIT).catch(console.error);

    fireballOpacity.setValue(0);
    setIsAttacking(false);
    onComplete();
});
```

### 4.2 可选：怪物闪烁效果
```typescript
// 简单的透明度闪烁
const monsterFlash = useRef(new Animated.Value(1)).current;

// 在命中时
Animated.sequence([
    Animated.timing(monsterFlash, { toValue: 0.3, duration: 100, useNativeDriver: true }),
    Animated.timing(monsterFlash, { toValue: 1, duration: 100, useNativeDriver: true }),
    Animated.timing(monsterFlash, { toValue: 0.3, duration: 100, useNativeDriver: true }),
    Animated.timing(monsterFlash, { toValue: 1, duration: 100, useNativeDriver: true }),
]).start();
```

---

## 实现顺序

| 步骤 | 任务 | 预计时间 |
|------|------|----------|
| 1 | 调整布局参数，测试竖屏效果 | 20min |
| 2 | 生成火球图片 | 5min |
| 3 | 添加火球动画状态和 Animated 值 | 10min |
| 4 | 实现 playFireballAnimation 函数 | 20min |
| 5 | 修改 handleWritingComplete 集成动画 | 15min |
| 6 | 添加火球渲染和样式 | 10min |
| 7 | 测试和调优 | 20min |

**总计**: 约 1.5-2 小时

---

## 测试检查点

- [ ] iPad 竖屏：英雄完整可见，不被田字格遮挡
- [ ] iPad 竖屏：怪物完整可见，在屏幕内
- [ ] iPad 横屏：布局正常
- [ ] 写对汉字后火球从英雄飞向怪物
- [ ] 火球动画流畅（约 0.6 秒）
- [ ] 火球命中后消失
- [ ] 命中时播放音效
- [ ] 动画期间无法重复触发
- [ ] TypeScript 类型检查通过

---

## Phase 2: Lottie 动画特效升级

### 目标
使用 Lottie 动画替换/增强现有静态效果，提供更酷炫的视觉体验。

### Step 5: 集成 Lottie

#### 5.1 安装依赖
```bash
npx expo install lottie-react-native
```

#### 5.2 下载特效资源
从 [LottieFiles](https://lottiefiles.com/) 下载：
- 火球爆炸效果 → `assets/lottie/explosion.json`
- 星星/奖励掉落 → `assets/lottie/stars.json`
- 攻击命中效果 → `assets/lottie/hit-effect.json`

#### 5.3 创建 Lottie 特效组件
```typescript
// src/components/LottieEffect.tsx
import LottieView from 'lottie-react-native';

interface LottieEffectProps {
    source: any;
    onComplete?: () => void;
    style?: any;
}

export function LottieEffect({ source, onComplete, style }: LottieEffectProps) {
    return (
        <LottieView
            source={source}
            autoPlay
            loop={false}
            onAnimationFinish={onComplete}
            style={style}
        />
    );
}
```

---

### Step 6: 替换火球命中效果

#### 修改文件
- `app/battle-v2.tsx`

#### 6.1 添加爆炸动画状态
```typescript
const [showExplosion, setShowExplosion] = useState(false);
const [explosionPosition, setExplosionPosition] = useState({ x: 0, y: 0 });
```

#### 6.2 火球命中时显示爆炸
```typescript
// 在 playFireballAnimation 完成时
.start(() => {
    // 设置爆炸位置（怪物中心）
    setExplosionPosition({ x: targetX, y: targetY });
    setShowExplosion(true);

    // 播放命中音效
    getAudioService().playSoundEffect(SoundEffect.HIT);

    fireballOpacity.setValue(0);
    setIsAttacking(false);

    // 爆炸动画完成后处理伤害
    setTimeout(() => {
        setShowExplosion(false);
        onComplete();
    }, 800);
});
```

#### 6.3 渲染爆炸效果
```typescript
{showExplosion && (
    <LottieView
        source={require('../assets/lottie/explosion.json')}
        autoPlay
        loop={false}
        style={{
            position: 'absolute',
            left: explosionPosition.x - 50,
            top: explosionPosition.y - 50,
            width: 100,
            height: 100,
            zIndex: 200,
        }}
    />
)}
```

---

### Step 7: 添加奖励动画

#### 7.1 怪物击败时星星效果
```typescript
const [showStars, setShowStars] = useState(false);

// 怪物死亡时
if (newHp <= 0) {
    setShowStars(true);
    setTimeout(() => setShowStars(false), 1500);
    // ... 原有逻辑
}
```

#### 7.2 渲染星星
```typescript
{showStars && (
    <LottieView
        source={require('../assets/lottie/stars.json')}
        autoPlay
        loop={false}
        style={styles.starsEffect}
    />
)}
```

---

### Step 8: 技能效果设计（框架）

基于讨论的游戏机制，技能效果方案：

| 技能 | Lottie 效果 | 游戏效果 | 教育影响 |
|------|-------------|----------|----------|
| 🔥 火球术 | 火焰爆炸动画 | 更酷的攻击视觉 | 无（伤害不变） |
| ❄️ 冰冻术 | 冰晶/雪花效果 | 怪物移动减速 50% | 无 |
| ⚡ 闪电链 | 电弧闪烁动画 | 答对时震晕怪物 1秒 | 无 |
| 🛡️ 护盾 | 护盾光环效果 | 抵挡一次攻击 | 无 |

**核心原则**：技能提供视觉和辅助效果，不减少书写次数。

---

## Lottie 资源清单

| 文件 | 用途 | 来源 |
|------|------|------|
| `explosion.json` | 火球命中 | LottieFiles |
| `stars.json` | 击败奖励 | LottieFiles |
| `hit-effect.json` | 普通命中 | LottieFiles |
| `ice-effect.json` | 冰冻技能 | LottieFiles |
| `lightning.json` | 闪电技能 | LottieFiles |
| `shield.json` | 护盾技能 | LottieFiles |

---

## 更新后的实现顺序

| Phase | 步骤 | 任务 | 状态 |
|-------|------|------|------|
| 1 | 1-4 | 基础布局和火球动画 | ✅ 已完成 |
| 2 | 5 | 集成 Lottie | ✅ 已完成 |
| 2 | 6 | 火球爆炸效果 | ✅ 已完成 |
| 2 | 7 | 奖励动画 | ✅ 已完成 |
| 2 | 8 | 技能效果框架 | 待开始 |

---

## 测试检查点（Phase 2）

- [ ] Lottie 库安装成功
- [ ] 爆炸动画正常播放
- [ ] 动画位置正确（在怪物位置）
- [ ] 动画完成后正确清理
- [ ] 星星奖励动画正常
- [ ] 性能无明显下降
- [ ] iOS 模拟器测试通过
