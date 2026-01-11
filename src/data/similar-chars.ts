// 形近字辨别题库

export interface SimilarCharQuestion {
    id: string;
    sentence: string;      // 带空格的句子，用 _ 标记填空位置
    answer: string;        // 正确答案
    options: string[];     // 选项（含正确答案，会随机打乱）
    explanation: string;   // 解释说明
    group: string;         // 形近字组标识
}

export const SIMILAR_CHAR_QUESTIONS: SimilarCharQuestion[] = [
    // === 己/已/巳 ===
    {
        id: 'sc-001',
        sentence: '自_介绍',
        answer: '己',
        options: ['己', '已', '巳'],
        explanation: '「己」指自己，「已」表示已经',
        group: '己已巳',
    },
    {
        id: 'sc-002',
        sentence: '_经完成了',
        answer: '已',
        options: ['己', '已', '巳'],
        explanation: '「已」表示已经，「己」指自己',
        group: '己已巳',
    },
    {
        id: 'sc-003',
        sentence: '知_知彼',
        answer: '己',
        options: ['己', '已', '巳'],
        explanation: '知己知彼，「己」是自己的意思',
        group: '己已巳',
    },

    // === 人/入 ===
    {
        id: 'sc-004',
        sentence: '大_来了',
        answer: '人',
        options: ['人', '入'],
        explanation: '「人」指人类，「入」是进入的意思',
        group: '人入',
    },
    {
        id: 'sc-005',
        sentence: '请_座',
        answer: '入',
        options: ['人', '入'],
        explanation: '入座是进入座位，用「入」',
        group: '人入',
    },
    {
        id: 'sc-006',
        sentence: '_口处',
        answer: '入',
        options: ['人', '入'],
        explanation: '入口是进去的地方，用「入」',
        group: '人入',
    },

    // === 大/太/犬 ===
    {
        id: 'sc-007',
        sentence: '_阳出来了',
        answer: '太',
        options: ['大', '太', '犬'],
        explanation: '太阳，「太」有非常的意思',
        group: '大太犬',
    },
    {
        id: 'sc-008',
        sentence: '这个苹果很_',
        answer: '大',
        options: ['大', '太', '犬'],
        explanation: '形容大小用「大」',
        group: '大太犬',
    },
    {
        id: 'sc-009',
        sentence: '_好了',
        answer: '太',
        options: ['大', '太', '犬'],
        explanation: '太好了，「太」表示非常',
        group: '大太犬',
    },

    // === 土/士/干 ===
    {
        id: 'sc-010',
        sentence: '泥_很软',
        answer: '土',
        options: ['土', '士', '干'],
        explanation: '泥土，「土」是土地的意思',
        group: '土士干',
    },
    {
        id: 'sc-011',
        sentence: '战_很勇敢',
        answer: '士',
        options: ['土', '士', '干'],
        explanation: '战士，「士」指士兵',
        group: '土士干',
    },
    {
        id: 'sc-012',
        sentence: '衣服_了',
        answer: '干',
        options: ['土', '士', '干'],
        explanation: '干了，「干」表示不湿',
        group: '土士干',
    },

    // === 日/目/田 ===
    {
        id: 'sc-013',
        sentence: '今_天气好',
        answer: '日',
        options: ['日', '目', '田'],
        explanation: '今日，「日」是日子的意思',
        group: '日目田',
    },
    {
        id: 'sc-014',
        sentence: '_光很好',
        answer: '目',
        options: ['日', '目', '田'],
        explanation: '目光，「目」是眼睛的意思',
        group: '日目田',
    },
    {
        id: 'sc-015',
        sentence: '稻_里有青蛙',
        answer: '田',
        options: ['日', '目', '田'],
        explanation: '稻田，「田」是田地',
        group: '日目田',
    },

    // === 木/本/禾 ===
    {
        id: 'sc-016',
        sentence: '树_很高',
        answer: '木',
        options: ['木', '本', '禾'],
        explanation: '树木，「木」是木头的意思',
        group: '木本禾',
    },
    {
        id: 'sc-017',
        sentence: '课_在哪里',
        answer: '本',
        options: ['木', '本', '禾'],
        explanation: '课本，「本」是书本',
        group: '木本禾',
    },
    {
        id: 'sc-018',
        sentence: '_苗长高了',
        answer: '禾',
        options: ['木', '本', '禾'],
        explanation: '禾苗，「禾」是庄稼',
        group: '木本禾',
    },

    // === 天/夫 ===
    {
        id: 'sc-019',
        sentence: '今_很冷',
        answer: '天',
        options: ['天', '夫'],
        explanation: '今天，「天」指日子或天空',
        group: '天夫',
    },
    {
        id: 'sc-020',
        sentence: '农_在种地',
        answer: '夫',
        options: ['天', '夫'],
        explanation: '农夫，「夫」指成年男子',
        group: '天夫',
    },

    // === 白/百/自 ===
    {
        id: 'sc-021',
        sentence: '_色的云',
        answer: '白',
        options: ['白', '百', '自'],
        explanation: '白色，「白」是颜色',
        group: '白百自',
    },
    {
        id: 'sc-022',
        sentence: '一_分',
        answer: '百',
        options: ['白', '百', '自'],
        explanation: '一百，「百」是数字100',
        group: '白百自',
    },
    {
        id: 'sc-023',
        sentence: '_己动手',
        answer: '自',
        options: ['白', '百', '自'],
        explanation: '自己，「自」表示自己',
        group: '白百自',
    },

    // === 了/子 ===
    {
        id: 'sc-024',
        sentence: '吃饭_',
        answer: '了',
        options: ['了', '子'],
        explanation: '「了」表示动作完成',
        group: '了子',
    },
    {
        id: 'sc-025',
        sentence: '孩_在玩',
        answer: '子',
        options: ['了', '子'],
        explanation: '孩子，「子」指小孩',
        group: '了子',
    },
    {
        id: 'sc-026',
        sentence: '好_，我知道了',
        answer: '了',
        options: ['了', '子'],
        explanation: '好了，「了」表示完成或语气词',
        group: '了子',
    },

    // === 万/方 ===
    {
        id: 'sc-027',
        sentence: '一_个人',
        answer: '万',
        options: ['万', '方'],
        explanation: '一万，「万」是数字10000',
        group: '万方',
    },
    {
        id: 'sc-028',
        sentence: '东_在哪里',
        answer: '方',
        options: ['万', '方'],
        explanation: '东方，「方」是方向',
        group: '万方',
    },

    // === 牛/午 ===
    {
        id: 'sc-029',
        sentence: '小_吃草',
        answer: '牛',
        options: ['牛', '午'],
        explanation: '小牛，「牛」是动物',
        group: '牛午',
    },
    {
        id: 'sc-030',
        sentence: '中_吃饭',
        answer: '午',
        options: ['牛', '午'],
        explanation: '中午，「午」是时间',
        group: '牛午',
    },

    // === 玉/王 ===
    {
        id: 'sc-031',
        sentence: '_石很美',
        answer: '玉',
        options: ['玉', '王'],
        explanation: '玉石，「玉」是宝石',
        group: '玉王',
    },
    {
        id: 'sc-032',
        sentence: '国_住在宫殿',
        answer: '王',
        options: ['玉', '王'],
        explanation: '国王，「王」是君主',
        group: '玉王',
    },

    // === 由/田/甲 ===
    {
        id: 'sc-033',
        sentence: '理_是什么',
        answer: '由',
        options: ['由', '田', '甲'],
        explanation: '理由，「由」表示原因',
        group: '由田甲',
    },
    {
        id: 'sc-034',
        sentence: '_野很广',
        answer: '田',
        options: ['由', '田', '甲'],
        explanation: '田野，「田」是田地',
        group: '由田甲',
    },

    // === 石/右 ===
    {
        id: 'sc-035',
        sentence: '_头很硬',
        answer: '石',
        options: ['石', '右'],
        explanation: '石头，「石」是岩石',
        group: '石右',
    },
    {
        id: 'sc-036',
        sentence: '向_转',
        answer: '右',
        options: ['石', '右'],
        explanation: '向右，「右」是方向',
        group: '石右',
    },

    // === 开/井 ===
    {
        id: 'sc-037',
        sentence: '_门进来',
        answer: '开',
        options: ['开', '井'],
        explanation: '开门，「开」是打开',
        group: '开井',
    },
    {
        id: 'sc-038',
        sentence: '水_里有水',
        answer: '井',
        options: ['开', '井'],
        explanation: '水井，「井」是打水的地方',
        group: '开井',
    },

    // === 又/叉 ===
    {
        id: 'sc-039',
        sentence: '_大又圆',
        answer: '又',
        options: ['又', '叉'],
        explanation: '又大又圆，「又」表示并列',
        group: '又叉',
    },
    {
        id: 'sc-040',
        sentence: '用_子吃饭',
        answer: '叉',
        options: ['又', '叉'],
        explanation: '叉子，「叉」是餐具',
        group: '又叉',
    },
];

// 随机获取指定数量的题目
export function getRandomQuestions(count: number = 10): SimilarCharQuestion[] {
    const shuffled = [...SIMILAR_CHAR_QUESTIONS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

// 打乱选项顺序
export function shuffleOptions(options: string[]): string[] {
    return [...options].sort(() => Math.random() - 0.5);
}
