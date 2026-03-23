# 萌宠大全与品种库改造计划

## 1. 数据库模型变更 (Backend)
- **新增 `Breed` (品种) 模型**
  - `id`: Integer (PK)
  - `name`: String (品种名称，如：金毛寻回犬)
  - `species`: String (物种：'dog' | 'cat' | 'other')
  - `description`: Text (百科介绍)
  - `origin`: String (原产地)
  - `temperament`: String (性格特点)
  - `image_url`: String (品种封面图)
  - `pet_count`: Integer (统计该品种下的宠物数量，可设为虚拟字段或缓存字段)

- **修改 `Pet` (宠物) 模型**
  - 新增 `breed_id`: Integer (FK -> Breed)
  - 移除原有的 `breed` 字符串字段 (或保留作为冗余/自定义备注，但主要关联 ID)

## 2. API 接口开发 (Backend)
- **Breeds API**
  - `GET /api/breeds`: 获取品种列表 (支持按 species 筛选，支持搜索)
  - `GET /api/breeds/:id`: 获取品种详情 (含百科信息 + 统计数据)
  - `POST /api/breeds`: (仅管理员) 添加新品种

- **Pet API 更新**
  - `POST /api/pets`: 创建宠物时，接收 `breed_id` 而非文本 `breed`。
  - 创建成功后，自动更新对应 Breed 的统计计数 (如有必要)。

## 3. 前端视图改造 (Frontend)
- **移除页面**
  - 删除 `src/views/Discover.vue` (发现)
  - 删除 `src/views/Service.vue` (服务)
  - 更新路由 `src/router/index.ts` 和底部导航栏 `src/components/Layout.vue`。

- **新增页面：萌宠大全 (PetEncyclopedia)**
  - **列表页**：展示猫/狗分类 Tab，网格展示品种卡片（图片+名称+已加入伙伴数）。
  - **详情页**：展示品种百科（性格、原产地、详细介绍），并列出该品种下的“明星宠物”或最近加入的宠物。

- **功能集成：添加宠物 (Profile)**
  - 改造 `AddPetModal`：将“品种”输入框改为**选择器**。
  - 点击选择品种时，弹出品种选择列表（支持搜索）。

## 4. 数据初始化 (Seed)
- 编写 `seed.ts`，预置至少 10-20 种常见猫狗品种数据，确保“萌宠大全”上线即有内容。
