import sequelize from './config/database.js';
import { User, Pet, Post, Breed } from './models/index.js';
import bcrypt from 'bcryptjs';

const seed = async () => {
  try {
    await sequelize.sync({ force: true }); // Reset database

    const hashedPassword = await bcrypt.hash('123456', 10);

    // Create Admin User
    const adminUser = await User.create({
      username: 'admin',
      password: hashedPassword,
      nickname: 'Admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
      role: 'admin'
    });

    // Create Regular Users
    const user1 = await User.create({
      username: 'user1',
      password: hashedPassword,
      nickname: 'Alice',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
      phone: '13800138001'
    });

    const user2 = await User.create({
      username: 'user2',
      password: hashedPassword,
      nickname: 'Bob',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
      phone: '13800138002'
    });

    // Create Breeds - Comprehensive List with Multiple Images
    const breeds = await Breed.bulkCreate([
      // --- DOGS ---
      {
        name: '金毛寻回犬',
        name_en: 'Golden Retriever',
        species: 'dog',
        origin: '英国',
        temperament: '聪明, 友善, 忠诚',
        lifespan: '10-12 年',
        weight: '25-34 公斤',
        height: '51-61 厘米',
        description: '金毛寻回犬是一种中大型枪猎犬，最初是为了在狩猎和射击派对中寻回被射中的水禽（如鸭子和高地猎鸟）而培育的。它们以温和、亲切和聪明的性格而闻名，是非常受欢迎的家庭宠物，也常作为导盲犬和服务犬。',
        images: [
          'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=800&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1597633425046-08f5110420b5?w=800&auto=format&fit=crop&q=60'
        ]
      },
      {
        name: '拉布拉多寻回犬',
        name_en: 'Labrador Retriever',
        species: 'dog',
        origin: '加拿大/英国',
        temperament: '外向, 温和, 活泼',
        lifespan: '10-12 年',
        weight: '25-36 公斤',
        height: '55-62 厘米',
        description: '拉布拉多寻回犬是一种起源于纽芬兰的猎犬。它们性格开朗，非常聪明，对人友善，是世界上最受欢迎的犬种之一。它们精力充沛，喜欢游泳和寻回游戏，非常适合有孩子的家庭。',
        images: [
          'https://images.unsplash.com/photo-1591769225440-811ad7d6eca6?w=800&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1579213838826-6b21c608f625?w=800&auto=format&fit=crop&q=60'
        ]
      },
      {
        name: '德国牧羊犬',
        name_en: 'German Shepherd',
        species: 'dog',
        origin: '德国',
        temperament: '自信, 勇敢, 聪明',
        lifespan: '9-13 年',
        weight: '22-40 公斤',
        height: '55-65 厘米',
        description: '德国牧羊犬是一种中大型的工作犬，起源于德国。它们以其智力、忠诚度和多才多艺而闻名，常被用于警察、军队、搜救和导盲等工作。它们对主人非常忠诚，但也需要大量的运动和精神刺激。',
        images: [
          'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=800&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1563725661-d790b9a674d8?w=800&auto=format&fit=crop&q=60'
        ]
      },
      {
        name: '法国斗牛犬',
        name_en: 'French Bulldog',
        species: 'dog',
        origin: '法国/英国',
        temperament: '亲切, 随和, 活泼',
        lifespan: '10-12 年',
        weight: '8-14 公斤',
        height: '28-33 厘米',
        description: '法国斗牛犬是一种小型家犬，是伴侣犬的绝佳选择。它们有着独特的蝙蝠耳和短吻，性格温和，喜欢与人相处，不需要太多的运动，非常适合城市公寓生活。',
        images: [
          'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1583336663277-620dc1996580?w=800&auto=format&fit=crop&q=60'
        ]
      },
      {
        name: '西伯利亚雪橇犬',
        name_en: 'Siberian Husky',
        species: 'dog',
        origin: '西伯利亚',
        temperament: '忠诚, 外向, 调皮',
        lifespan: '12-14 年',
        weight: '16-27 公斤',
        height: '51-60 厘米',
        description: '西伯利亚雪橇犬（哈士奇）是一种中型工作犬，属于斯皮茨犬系。它们拥有厚实的双层被毛和独特的面部斑纹，性格友好但独立，精力非常旺盛，需要大量的运动。',
        images: [
          'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=800&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1617895153857-82fe79adfcd4?w=800&auto=format&fit=crop&q=60'
        ]
      },
      {
        name: '贵宾犬',
        name_en: 'Poodle',
        species: 'dog',
        origin: '法国/德国',
        temperament: '活跃, 自豪, 非常聪明',
        lifespan: '10-18 年',
        weight: '20-32 公斤 (标准)',
        height: '45-60 厘米 (标准)',
        description: '贵宾犬以其卷曲的低过敏性被毛和极高的智商而闻名。它们分为标准型、迷你型和玩具型三种。贵宾犬性格活泼，易于训练，是优秀的家庭宠物和表演犬。',
        images: [
          'https://images.unsplash.com/photo-1516934024742-b461fba47600?w=800&auto=format&fit=crop&q=60'
        ]
      },
      {
        name: '英国斗牛犬',
        name_en: 'Bulldog',
        species: 'dog',
        origin: '英国',
        temperament: '温顺, 固执, 友善',
        lifespan: '8-10 年',
        weight: '18-23 公斤',
        height: '31-40 厘米',
        description: '英国斗牛犬是一种中型犬，体格健壮，面部有皱纹，鼻子扁平。虽然外表看起来有些凶猛，但其实它们性格非常温和、沉稳，对孩子特别友善，是很好的家庭伴侣。',
        images: [
          'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800&auto=format&fit=crop&q=60'
        ]
      },
      {
        name: '比格犬',
        name_en: 'Beagle',
        species: 'dog',
        origin: '英国',
        temperament: '快乐, 友善, 好奇',
        lifespan: '10-15 年',
        weight: '9-11 公斤',
        height: '33-41 厘米',
        description: '比格犬是一种小型嗅觉猎犬，最初用于狩猎野兔。它们拥有极佳的嗅觉和追踪本能，性格开朗活泼，喜欢群居。由于好奇心强，出门时必须牵好绳子。',
        images: [
          'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=800&auto=format&fit=crop&q=60'
        ]
      },
      {
        name: '罗威纳犬',
        name_en: 'Rottweiler',
        species: 'dog',
        origin: '德国',
        temperament: '忠诚, 慈爱, 自信的守护者',
        lifespan: '9-10 年',
        weight: '35-60 公斤',
        height: '56-69 厘米',
        description: '罗威纳犬是一种强壮的犬种，最初被用来放牧牲畜和拉车。它们是天生的护卫犬，对家庭非常忠诚和保护，但需要早期且持续的社会化训练和严格的指导。',
        images: [
          'https://images.unsplash.com/photo-1567752881298-894bb81f9379?w=800&auto=format&fit=crop&q=60'
        ]
      },
      {
        name: '腊肠犬',
        name_en: 'Dachshund',
        species: 'dog',
        origin: '德国',
        temperament: '聪明, 固执, 忠诚',
        lifespan: '12-16 年',
        weight: '7-15 公斤',
        height: '20-23 厘米',
        description: '腊肠犬因其长身短腿的独特外形而被称为“香肠狗”。它们最初是为捕猎獾而培育的，性格勇敢、活泼，有时会有些固执。它们对主人非常依恋。',
        images: [
          'https://images.unsplash.com/photo-1612195583950-b8fd34c87093?w=800&auto=format&fit=crop&q=60'
        ]
      },
      {
        name: '彭布罗克威尔士柯基',
        name_en: 'Pembroke Welsh Corgi',
        species: 'dog',
        origin: '威尔士',
        temperament: '深情, 聪明, 警觉',
        lifespan: '12-15 年',
        weight: '10-14 公斤',
        height: '25-30 厘米',
        description: '柯基犬是一种小型牧牛犬，以其短腿、大耳朵和圆润的臀部而闻名。它们精力充沛，非常聪明，喜欢取悦主人，是深受英国皇室喜爱的犬种。',
        images: [
          'https://images.unsplash.com/photo-1612536053345-118d931c730f?w=800&auto=format&fit=crop&q=60'
        ]
      },
      {
        name: '澳大利亚牧羊犬',
        name_en: 'Australian Shepherd',
        species: 'dog',
        origin: '美国',
        temperament: '聪明, 工作导向, 热情',
        lifespan: '12-15 年',
        weight: '18-29 公斤',
        height: '46-58 厘米',
        description: '尽管名字叫澳大利亚牧羊犬，但它们实际上是在美国西部牧场发展起来的。它们是极其聪明的牧羊犬，拥有无限的精力，需要大量的工作或运动来保持快乐。',
        images: [
          'https://images.unsplash.com/photo-1529429617124-95b109e86bb8?w=800&auto=format&fit=crop&q=60'
        ]
      },
      {
        name: '约克夏梗',
        name_en: 'Yorkshire Terrier',
        species: 'dog',
        origin: '英国',
        temperament: '深情, 活泼, 假小子',
        lifespan: '11-15 年',
        weight: '2-3 公斤',
        height: '17-20 厘米',
        description: '约克夏梗是一种体型虽小但个性十足的犬种。它们拥有丝绸般的长毛，性格勇敢、自信，甚至有点霸道。它们是很好的城市伴侣犬。',
        images: [
          'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=800&auto=format&fit=crop&q=60'
        ]
      },
      {
        name: '拳师犬',
        name_en: 'Boxer',
        species: 'dog',
        origin: '德国',
        temperament: '聪明, 爱玩, 活跃',
        lifespan: '10-12 年',
        weight: '25-32 公斤',
        height: '53-63 厘米',
        description: '拳师犬是一种中大型短毛犬，肌肉发达，精力充沛。它们性格开朗，像个长不大的孩子，对家人非常忠诚和保护，是优秀的家庭护卫犬。',
        images: [
          'https://images.unsplash.com/photo-1543071220-6ee5bf71a54e?w=800&auto=format&fit=crop&q=60'
        ]
      },
      {
        name: '大丹犬',
        name_en: 'Great Dane',
        species: 'dog',
        origin: '德国',
        temperament: '友善, 耐心, 可靠',
        lifespan: '7-10 年',
        weight: '50-82 公斤',
        height: '71-86 厘米',
        description: '大丹犬是犬界的“温柔巨人”。尽管体型巨大，但它们通常性格温和、友善，喜欢与人亲近。它们需要较大的生活空间，但并不像人们想象的那样需要极大量的运动。',
        images: [
          'https://images.unsplash.com/photo-1563889958749-625d0c75c8e6?w=800&auto=format&fit=crop&q=60'
        ]
      },
      {
        name: '柴犬',
        name_en: 'Shiba Inu',
        species: 'dog',
        origin: '日本',
        temperament: '警觉, 独立, 忠诚',
        lifespan: '12-15 年',
        weight: '8-10 公斤',
        height: '33-43 厘米',
        description: '柴犬是日本本土最小的犬种，最初用于在灌木丛中狩猎鸟类和小型猎物。它们性格独立，爱干净，有时像猫一样。对主人忠诚，但对陌生人可能比较冷淡。',
        images: [
          'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&auto=format&fit=crop&q=60'
        ]
      },
      {
        name: '边境牧羊犬',
        name_en: 'Border Collie',
        species: 'dog',
        origin: '英国/苏格兰',
        temperament: '极度聪明, 精力旺盛, 敏锐',
        lifespan: '12-15 年',
        weight: '14-20 公斤',
        height: '46-56 厘米',
        description: '边境牧羊犬被公认为世界上最聪明的犬种。它们是工作狂，拥有惊人的精力和专注力，非常擅长飞盘和敏捷运动。如果没有足够的工作或运动，它们可能会产生行为问题。',
        images: [
          'https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?w=800&auto=format&fit=crop&q=60'
        ]
      },
      
      // --- CATS ---
      {
        name: '英国短毛猫',
        name_en: 'British Shorthair',
        species: 'cat',
        origin: '英国',
        temperament: '深情, 随和, 镇静',
        lifespan: '12-17 年',
        weight: '4-8 公斤',
        height: '30-35 厘米',
        description: '英国短毛猫是英国最古老的猫种之一，以其圆润的体型、密实的被毛和宽大的脸庞而闻名。它们性格非常沉稳、随和，喜欢安静地陪伴在主人身边，适合各种家庭。',
        images: [
          'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1588667354964-b58032770267?w=800&auto=format&fit=crop&q=60'
        ]
      },
      {
        name: '缅因猫',
        name_en: 'Maine Coon',
        species: 'cat',
        origin: '美国',
        temperament: '温和, 聪明, 独立',
        lifespan: '12-15 年',
        weight: '6-11 公斤',
        height: '25-41 厘米',
        description: '缅因猫是体型最大的家猫品种之一，被称为“温柔的巨人”。它们拥有厚实的防水被毛和毛茸茸的大尾巴，性格像狗一样忠诚、友好，甚至喜欢玩水和捡球。',
        images: [
          'https://images.unsplash.com/photo-1582562124811-c8f2b312b33c?w=800&auto=format&fit=crop&q=60'
        ]
      },
      {
        name: '波斯猫',
        name_en: 'Persian',
        species: 'cat',
        origin: '伊朗 (波斯)',
        temperament: '安静, 甜美, 和平',
        lifespan: '12-17 年',
        weight: '3-6 公斤',
        height: '20-25 厘米',
        description: '波斯猫以其长而华丽的被毛、扁平的脸和圆圆的眼睛而闻名。它们是猫中的贵族，性格非常安静、优雅，喜欢在室内过舒适的生活，需要每天梳理毛发。',
        images: [
          'https://images.unsplash.com/photo-1617066866166-41846c8731d1?w=800&auto=format&fit=crop&q=60'
        ]
      },
      {
        name: '布偶猫',
        name_en: 'Ragdoll',
        species: 'cat',
        origin: '美国',
        temperament: '深情, 友善, 温和',
        lifespan: '12-15 年',
        weight: '4-9 公斤',
        height: '23-28 厘米',
        description: '布偶猫因其被抱起时会像布偶一样全身放松而得名。它们拥有蓝色的眼睛和重点色被毛，性格极其温顺、粘人，喜欢像狗一样跟随主人，非常适合有孩子的家庭。',
        images: [
          'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=800&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1629815481661-d779277f3f1e?w=800&auto=format&fit=crop&q=60'
        ]
      },
      {
        name: '暹罗猫',
        name_en: 'Siamese',
        species: 'cat',
        origin: '泰国',
        temperament: '社交, 深情, 精力充沛',
        lifespan: '15-20 年',
        weight: '3-5 公斤',
        height: '20-25 厘米',
        description: '暹罗猫是著名的短毛猫，以其苗条的身材、重点色被毛和深蓝色的眼睛为特征。它们非常聪明、活跃，而且是个“话痨”，喜欢用独特的声音与主人交流。',
        images: [
          'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=800&auto=format&fit=crop&q=60'
        ]
      },
      {
        name: '美国短毛猫',
        name_en: 'American Shorthair',
        species: 'cat',
        origin: '美国',
        temperament: '随和, 友善, 适应力强',
        lifespan: '15-20 年',
        weight: '4-7 公斤',
        height: '25-35 厘米',
        description: '美国短毛猫是早期移民带到北美的猫的后代，最初用于捕鼠。它们体格健壮，性格平衡、随和，适应能力强，是极佳的家庭伴侣，以经典的银色虎斑纹最为常见。',
        images: [
          'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&auto=format&fit=crop&q=60'
        ]
      },
      {
        name: '斯芬克斯猫',
        name_en: 'Sphynx',
        species: 'cat',
        origin: '加拿大',
        temperament: '精力充沛, 调皮, 深情',
        lifespan: '12-14 年',
        weight: '3-5 公斤',
        height: '20-25 厘米',
        description: '斯芬克斯猫（无毛猫）以其几乎无毛的外表而闻名。虽然外表独特，但它们性格极其外向、友好，喜欢被关注和拥抱（为了取暖）。它们摸起来像温暖的桃子皮。',
        images: [
          'https://images.unsplash.com/photo-1606214174585-fe31582dc6ee?w=800&auto=format&fit=crop&q=60'
        ]
      },
      {
        name: '孟加拉猫',
        name_en: 'Bengal',
        species: 'cat',
        origin: '美国',
        temperament: '活跃, 精力充沛, 爱玩',
        lifespan: '12-16 年',
        weight: '4-7 公斤',
        height: '25-30 厘米',
        description: '孟加拉猫拥有像豹子一样的斑点被毛，是家猫与亚洲豹猫的杂交后代。它们保留了野性的外观，但性格亲人。它们精力极其旺盛，喜欢攀爬甚至玩水。',
        images: [
          'https://images.unsplash.com/photo-1612999742633-5c8c6d4825d8?w=800&auto=format&fit=crop&q=60'
        ]
      },
      {
        name: '苏格兰折耳猫',
        name_en: 'Scottish Fold',
        species: 'cat',
        origin: '英国 (苏格兰)',
        temperament: '甜美, 适应力强, 慈爱',
        lifespan: '11-14 年',
        weight: '3-6 公斤',
        height: '20-25 厘米',
        description: '苏格兰折耳猫最显著的特征是其向前折叠的耳朵，赋予它们像猫头鹰一样的可爱外观。它们性格甜美、安静，喜欢用类似“佛陀坐姿”的方式坐着。需注意其遗传骨骼问题。',
        images: [
          'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&auto=format&fit=crop&q=60'
        ]
      },
      {
        name: '阿比西尼亚猫',
        name_en: 'Abyssinian',
        species: 'cat',
        origin: '埃及/埃塞俄比亚',
        temperament: '活跃, 精力充沛, 独立',
        lifespan: '12-15 年',
        weight: '3-5 公斤',
        height: '20-25 厘米',
        description: '阿比西尼亚猫被认为是古埃及猫的后代。它们拥有独特的“通过”斑纹被毛，身形优雅。性格非常活跃、好奇，喜欢在高处观察，不喜欢长时间被抱在怀里。',
        images: [
          'https://images.unsplash.com/photo-1628148809477-70c896e00b99?w=800&auto=format&fit=crop&q=60'
        ]
      },
      {
        name: '伯曼猫',
        name_en: 'Birman',
        species: 'cat',
        origin: '法国/缅甸',
        temperament: '深情, 温和, 安静',
        lifespan: '12-16 年',
        weight: '4-7 公斤',
        height: '20-25 厘米',
        description: '伯曼猫被称为“缅甸圣猫”。它们拥有长而丝滑的被毛、蓝眼睛和四只独特的白色“手套”。性格非常温和、有耐心，是理想的室内伴侣猫。',
        images: [
          'https://images.unsplash.com/photo-1616423664045-60dd04623e80?w=800&auto=format&fit=crop&q=60'
        ]
      },
      {
        name: '俄罗斯蓝猫',
        name_en: 'Russian Blue',
        species: 'cat',
        origin: '俄罗斯',
        temperament: '温和, 安静, 害羞',
        lifespan: '15-20 年',
        weight: '3-5 公斤',
        height: '20-25 厘米',
        description: '俄罗斯蓝猫拥有银蓝色的短绒毛和翠绿色的眼睛。它们性格内向、害羞，喜欢安静的环境，对主人非常忠诚，但在陌生人面前会比较保留。',
        images: [
          'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=800&auto=format&fit=crop&q=60'
        ]
      },
      {
        name: '挪威森林猫',
        name_en: 'Norwegian Forest Cat',
        species: 'cat',
        origin: '挪威',
        temperament: '独立, 聪明, 社交',
        lifespan: '12-16 年',
        weight: '6-9 公斤',
        height: '30-45 厘米',
        description: '挪威森林猫是北欧神话中的猫，拥有厚实的防水双层被毛，能适应寒冷气候。它们体型巨大，擅长攀爬，性格独立但友善，喜欢在户外探险。',
        images: [
          'https://images.unsplash.com/photo-1603277150238-70bd33932a92?w=800&auto=format&fit=crop&q=60'
        ]
      }
    ]);

    const goldenRetriever = breeds.find(b => b.name_en === 'Golden Retriever');
    const britishShorthair = breeds.find(b => b.name_en === 'British Shorthair');

    // Create Pets
    await Pet.create({
      user_id: user1.id,
      name: 'Buddy',
      breed_id: goldenRetriever?.id,
      breed_name: 'Golden Retriever',
      age: 3,
      gender: 'male',
      avatar: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400'
    });

    await Pet.create({
      user_id: user2.id,
      name: 'Kitty',
      breed_id: britishShorthair?.id,
      breed_name: 'British Shorthair',
      age: 2,
      gender: 'female',
      avatar: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400'
    });

    // Create Posts
    await Post.create({
      user_id: user1.id,
      content: 'Hello Pet Circle! This is Buddy.',
      images: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=800'],
      location: 'Central Park',
      likes: 5,
      comments_count: 2
    });

    await Post.create({
      user_id: user2.id,
      content: 'Kitty is sleeping all day.',
      images: ['https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800'],
      location: 'Home',
      likes: 10,
      comments_count: 3
    });

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed database:', error);
    process.exit(1);
  }
};

seed();
