import { getInfoById } from "./updateInfo";

const baseUrl = 'https://applet.cdn.wanjuyuanxian.com/nzgx/static/clues/'
type Clue = {
    id: number;
    type: '物品' | '人物' | '场景' | string; // 可以根据实际情况扩展类型的可选值
    name: string;
    content1: string;
    content2: string;
    url: string;
};

// 定义包含多个线索的对象类型
type Clues = {
    [key: string]: Clue;
};
export let allClues: Clues = {
    clue1:{
        id: 1,
        type: '物品',
        name: '尸体',
        content1: '一个女性的头颅，嘴角有血迹',
        content2: '春天的头颅，嘴角还残留了一丝血迹',
        url: baseUrl + 'clue1',
    },
    clue2:{
        id: 2,
        type: '物品',
        name: '尸块',
        content1: '左手臂',
        content2: '春天的左臂',
        url: baseUrl + 'clue2',
    },
    clue3:{
        id: 3,
        type: '物品',
        name: '尸块',
        content1: '右手臂',
        content2: '春天的右臂',
        url: baseUrl + 'clue3',
    },
    clue4:{
        id: 4,
        type: '物品',
        name: '尸块',
        content1: '双腿',
        content2: '春天的双腿',
        url: baseUrl + 'clue4',
    },
    clue5:{
        id: 5,
        type: '物品',
        name: '残缺的尸体',
        content1: '拼凑起来的尸体，但是缺少躯干部分',
        content2: '你们找到了春天的头和四肢，却唯独少了躯干部分，似乎躯干被人销毁或是刻意隐藏。',
        url: baseUrl + 'clue5',
    },
    clue6:{
        id: 6,
        type: '物品',
        name: '尹萍的个人线索',
        content1: '一些纱布和外伤药物，以及一张医务室的诊断书：左手大拇指指甲盖断裂。',
        content2: '',
        url: baseUrl + 'clue6',
    },
    clue7:{
        id: 7,
        type: '物品',
        name: '李梦的个人线索',
        content1: '一张课外活动时间的社团签到表，其中尹萍的签名力透纸背十分漂亮',
        content2: '',
        url: baseUrl + 'clue7',
    },
    clue8:{
        id: 8,
        type: '物品',
        name: '林佳的个人线索',
        content1: '一张陈慧娴的海报，上面有两个小字——黄鹂（可深入）',
        content2: '',
        url: baseUrl + 'clue8',
    },
    clue9:{
        id: 9,
        type: '物品',
        name: '何阑的个人线索',
        content1: '一张字迹娟秀的小纸条，上面写着：老大，野猫的事情已经搞定',
        content2: '',
        url: baseUrl + 'clue9',
    },
    clue10:{
        id: 10,
        type: '物品',
        name: '陈敏的个人线索',
        content1: '一张写满了字的纸条，做模糊处理，只看得见密密麻麻的字，但是看不见内容。（可深入）',
        content2: '',
        url: baseUrl + 'clue10',
    },
    clue11:{
        id: 11,
        type: '物品',
        name: '白鹭的个人线索',
        content1: '一张草稿纸，上面潦草地写着很多人名，很难辨认，在表演队队长那一栏原本的人名被涂抹掉，后面写上了白鹭。',
        content2: '',
        url: baseUrl + 'clue11',
    },
    clue12:{
        id: 12,
        type: '物品',
        name: '举报信',
        content1: '一张写满了字的纸条，标题上写着：举报信',
        content2: '',
        url: baseUrl + 'clue12',
    },
    clue13:{
        id: 13,
        type: '物品',
        name: '海报背面',
        content1: '海报背面写着：从后山逃出去以后就可以举报他们了，你也受不了他们很久了吧？这次我一定会配合你（是春天的字迹）',
        content2: '',
        url: baseUrl + 'clue13',
    },
    clue14:{
        id: 14,
        type: '物品',
        name: '一张连环画',
        content1: '画的内容：一个女生，头发披散跌坐在地上，几个女生围站在她身边，地上是野猫的尸体。',
        content2: '这个女生看上去像是春天，难道她们在霸凌她吗？',
        url: baseUrl + 'clue14',
    },
    clue15:{
        id: 15,
        type: '物品',
        name: '学生名册',
        content1: '一本学生名册，看的出来里面有6页内页。',
        content2: '',
        url: baseUrl + 'clue15',
    },
    clue16:{
        id: 16,
        type: '物品',
        name: '一个学生名牌',
        content1: '名牌内容：黄鹂。',
        content2: '似乎这个叫黄鹂的女生和白鹭以及其他几人关系都蛮好的。',
        url: baseUrl + 'clue16',
    },
    clue17:{
        id: 17,
        type: '物品',
        name: '两张诊疗记录',
        content1: '一张诊疗记录上说春天有严重的恐血症，有时还会有些应激反应，应激时可能伴随无法控制的暴力行为。另一张详细内容被水杯盖住了，日期哪里做模糊处理，或者写的看不清',
        content2: '“这个日期，好像是……今天”',
        url: baseUrl + 'clue17',
    },
    clue18:{
        id: 18,
        type: '物品',
        name: '课表',
        content1: '黑板上写着今日课表：14:00~14:45 第一节课，14:45~14:50 眼保健操，14:50~15:00课间休息，15:00~15:45第二节课，15:45~15:55 课间休息，15:55~16:40 第三节课，16:40~17:00 休息，17:00~18:00 自习 课外活动，18:00~19:00 晚餐 休息，19:00~21:00 晚自习（文艺汇演），21:00~21:50 回宿舍 洗漱，21:50 熄灯就寝',
        content2: '',
        url: baseUrl + 'clue18',
    },
    clue19:{
        id: 19,
        type: '音频',
        name: '何阑&白鹭',
        content1: '教学楼',
        content2: '要是她知道，我们这样对待春天。怕是变成鬼都不会放过我们吧。  连她都是我亲自处理的，这路是她自己选的。春天也一样，我是不会心慈手软的。  你能这么想就好了。',
        url: baseUrl + 'clue19',
    },
    clue20:{
        id: 20,
        type: '音频',
        name: '尹萍&陈敏',
        content1: '花坛',
        content2: '尹萍，春天应该已经准备要举报了，我们不能就这么看着她。 呜呜呜，我害怕举报。',
        url: baseUrl + 'clue20',
    },
    clue21:{
        id: 21,
        type: '头像',
        name: '春天',
        content1: '',
        content2: '',
        url: baseUrl + 'clue21',
    },
    clue22:{
        id: 22,
        type: '头像',
        name: '陈敏',
        content1: '',
        content2: '',
        url: baseUrl + 'clue22',
    },
    clue23:{
        id: 23,
        type: '头像',
        name: '尹萍',
        content1: '',
        content2: '',
        url: baseUrl + 'clue23',
    },
    clue24:{
        id: 24,
        type: '头像',
        name: '林佳',
        content1: '',
        content2: '',
        url: baseUrl + 'clue24',
    },
    clue25:{
        id: 25,
        type: '头像',
        name: '白鹭',
        content1: '',
        content2: '',
        url: baseUrl + 'clue25',
    },
    clue26:{
        id: 26,
        type: '头像',
        name: '李梦',
        content1: '',
        content2: '',
        url: baseUrl + 'clue26',
    },
    clue27:{
        id: 27,
        type: '头像',
        name: '何阑',
        content1: '',
        content2: '',
        url: baseUrl + 'clue27',
    },
    clue28:{
        id: 28,
        type: '物品',
        name: '尹萍的个人线索2',
        content1: '糖果',
        content2: '一些糖果，整个学校只有校长办公室的桌上摆着类似的糖果',
        url: baseUrl + 'clue28',
    },
    clue29:{
        id: 29,
        type: '物品',
        name: '李梦的个人线索2',
        content1: '一张卫生巾',
        content2: '用过却没有染血的卫生巾',
        url: baseUrl + 'clue29',
    },
    clue30:{
        id: 30,
        type: '物品',
        name: '林佳的个人线索2',
        content1: '一瓶维生素E和购买记录（可深入）',
        content2: '维生素E，好像又叫生育酚',
        url: baseUrl + 'clue30',
    },
    clue31:{
        id: 31,
        type: '物品',
        name: '何阑的个人线索2',
        content1: '一条白色的连衣裙，但是有帽子，看上去更像是一件斗篷。',
        content2: '斗篷看上去有些脏旧，应该从来没有洗过',
        url: baseUrl + 'clue31',
    },
    clue32:{
        id: 32,
        type: '物品',
        name: '陈敏的个人线索2',
        content1: '一张老旧的学生证，上面的照片有些模糊，照片中的人看样子比陈敏成熟很多，但是依稀能看出和陈敏长得很像',
        content2: '这个人，和陈敏有点像',
        url: baseUrl + 'clue32',
    },
    clue33:{
        id: 33,
        type: '物品',
        name: '白鹭的个人线索2',
        content1: '一张生物实验室上课的照片（可深入）',
        content2: '',
        url: baseUrl + 'clue33',
    },
    clue34:{
        id: 34,
        type: '物品',
        name: '维生素E的购买记录',
        content1: '购买人一栏填的名字是：何阑',
        content2: '',
        url: baseUrl + 'clue34',
    },
    clue35:{
        id: 35,
        type: '物品',
        name: '生物实验室里的骨架',
        content1: '白鹭在生物实验室聊天站的位置正对着一具骨架，骨架上面还有些泥土沾染的痕迹',
        content2: '',
        url: baseUrl + 'clue35',
    },
    clue36:{
        id: 36,
        type: '物品',
        name: '刊登着“流氓罪”新闻的报纸',
        content1: '',
        content2: '80年代打击流氓罪的力度很大，只不过那时对于流氓罪的定义还是“聚众斗殴，寻衅滋事，侮辱妇女或者进行其他流氓活动，破坏公共秩序，处七年以下有期徒刑、拘役或者管制。情节恶劣的，处七年以上有期徒刑或死刑。”',
        url: baseUrl + 'clue36',
    },
    clue37:{
        id: 37,
        type: '物品',
        name: '一则恐怖怪谈',
        content1: '这里流传着关于深夜出没的白衣女鬼传闻',
        content2: '这里流传着关于深夜出没的白衣女鬼传闻',
        url: baseUrl + 'clue37',
    },
    clue38:{
        id: 38,
        type: '音频',
        name: '李梦&林佳',
        content1: '宿舍',
        content2: '我知道身体重要，可是我们突然面对这么大的事情，我还是有一些不适应。而且我听有人说，这件事情春天也不会留下什么好名声。 这么说起来，春天现在情况也和我们一样。我还是有些不忍心，但是现在不是心软的时候。如果不对她做这些，一切都毁了。',
        url: baseUrl + 'clue38',
    },
    clue39:{
        id: 39,
        type: '音频',
        name: '白鹭&李梦',
        content1: '食堂',
        content2: '天都已经没那么冷了，你还在给何阑织围脖呢？ 你反应这么大做什么，又不是要判你跟何阑流氓罪。',
        url: baseUrl + 'clue39',
    },
    clue40:{
        id: 40,
        type: '音频',
        name: '林佳&陈敏',
        content1: '宿舍',
        content2: '林佳你的伙食可真好，这可是别人没有的。我猜是尹萍为你们这些特殊人士准备的吧。',
        url: baseUrl + 'clue40',
    },
    clue41:{
        id: 41,
        type: '音频',
        name: '陈敏&李梦',
        content1: '操场',
        content2: '你们说有什么白衣女鬼在鬼楼，又说什么最近那女鬼到了你们的宿舍，晚上在洗衣房洗什么东西？有什么证据吗？',
        url: baseUrl + 'clue41',
    },
    clue42:{
        id: 42,
        type: '物品',
        name: '尹萍的个人线索3',
        content1: '本周食堂菜谱：单日两荤一素，双日两素一荤',
        content2: '',
        url: baseUrl + 'clue42',
    },
    clue43:{
        id: 43,
        type: '物品',
        name: '李梦的个人线索3',
        content1: '一些毛线织物（可深入）',
        content2: '',
        url: baseUrl + 'clue43',
    },
    clue44:{
        id: 44,
        type: '物品',
        name: '林佳的个人线索3',
        content1: '一张字迹潦草的纸条，上面写着：晚自习你得请假，有些事情你得当面给我解释清楚。',
        content2: '',
        url: baseUrl + 'clue44',
    },
    clue45:{
        id: 45,
        type: '物品',
        name: '何阑的个人线索3',
        content1: '一封家书（可深入）',
        content2: '',
        url: baseUrl + 'clue45',
    },
    clue46:{
        id: 46,
        type: '物品',
        name: '陈敏的个人线索3',
        content1: '一本字典，男人的衣物和剃须刀。字典上面写着一行字：“Dear my honey” ',
        content2: '箱子里有一本字典，男人的衣物和剃须刀。字典上面写着一行字:"Dear my honey东西都被装在箱子里，看起来不想让人看到',
        url: baseUrl + 'clue46',
    },
    clue47:{
        id: 47,
        type: '物品',
        name: '白鹭的个人线索3',
        content1: '一张每日21:00自发签名记录的宿舍就寝表，上面记录了301号宿舍本周就寝时间的在寝记录。周一有李梦、林佳、白鹭三人的签名，周二只有林佳一人的签名。其余几天是空白（均为本人字迹）',
        content2: '',
        url: baseUrl + 'clue47',
    },
    clue48:{
        id: 48,
        type: '物品',
        name: '毛线织物',
        content1: '有婴儿的衣物，还有一条围巾，围巾角落织有春天的名字',
        content2: '',
        url: baseUrl + 'clue48',
    },
    clue49:{
        id: 49,
        type: '物品',
        name: '家书',
        content1: '村里对于你和你妹妹的传言慢慢消散了，再过一段时间就把你接回来，让你男扮女装进入这个学校真是委屈你了。信下面的署名是父亲。',
        content2: '',
        url: baseUrl + 'clue49',
    },
    clue50:{
        id: 50,
        type: '物品',
        name: '一本保安的日记和一根使用过的验孕棒',
        content1: 'XX月XX日：今天第一次看见她，她简直是我心目中的天仙，有时候癞蛤蟆也是想尝尝天鹅肉的，嘿嘿嘿，哪怕这只癞蛤蟆还有些身体问题，嘿嘿嘿。XX月XX日：我动用了手边的一切关系，把她留在了我身边，谁叫我知道的太多又是这里的关系户呢。虽然那帮老变态都是大人物我也惹不起，不过我还是不希望那帮老变态碰她。XX月XX日：不可能，她怎么会忍心这么对我，难道这一切只是我一厢情愿，我明明为她做了那么多，不行我一定要把这件事问清楚，不然我会让她尝尝地狱的滋味是什么样。',
        content2: '',
        url: baseUrl + 'clue50',
    }
};
export const updateOriClueInfo = async () => {
    const res_flow = await getInfoById(2)
    allClues = JSON.parse(res_flow.data.description)
}


