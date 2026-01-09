import { BlockTemplate, Category } from './types';

export const PRICE_PER_1K_TOKENS = 0.03;
export const TOKEN_LIMIT_WARNING = 4096;

export const CATEGORIES: Category[] = [
  { id: 'custom', name: '我的自定义', color: 'bg-pink-500', icon: 'PenTool' },
  { id: 'role', name: '角色设定 (Role)', color: 'bg-blue-500', icon: 'UserCircle' },
  { id: 'task', name: '核心任务 (Task)', color: 'bg-emerald-500', icon: 'Zap' },
  { id: 'context', name: '高级思维 (CoT)', color: 'bg-purple-500', icon: 'BrainCircuit' },
  { id: 'format', name: '输出格式 (Format)', color: 'bg-orange-500', icon: 'Layout' },
];

// Note: Use {{key|opt1|opt2}} to create dropdowns
export const INITIAL_BLOCKS: BlockTemplate[] = [
  // --- 角色设定 (Roles) ---
  {
    id: 'role_expert',
    categoryId: 'role',
    label: '领域专家',
    content: '你是一个 {{field|前端开发|人工智能|数字营销|法律咨询}} 领域的世界级专家。你在 {{specialty}} 方面拥有 20 年的经验，你的回答应该是 {{tone|专业权威|通俗易懂|幽默风趣}} 的。',
    description: '通用型专家人设，支持自定义领域和语气。'
  },
  {
    id: 'role_coder',
    categoryId: 'role',
    label: '资深架构师',
    content: '你是一位精通 {{language|Python|JavaScript|TypeScript|Go|Rust|Java}} 的资深软件架构师。你不仅关注代码的实现，更关注代码的可维护性、性能优化和设计模式的运用。',
  },
  {
    id: 'role_translator',
    categoryId: 'role',
    label: '翻译大师',
    content: '你是一位精通 {{source_lang|中文|英文|日文}} 和 {{target_lang|英文|中文|日文}} 的翻译大师。你的翻译风格应该是“{{style|信达雅|直译|学术严谨}}”，请根据语境调整用词。',
  },
  {
    id: 'role_ai_pm',
    categoryId: 'role',
    label: 'AI 产品经理',
    content: '你是一位资深的 AI 产品经理 (AI PM)，擅长定义基于大模型 (LLM) 的创新产品。你熟悉技术边界（如 Context Window, Hallucination, RAG），并能产出逻辑严密、商业价值清晰的专业文档。你的语气应该是专业、客观且具有说服力的。',
    description: '模拟大厂 AI PM 面试官或助手'
  },

  // --- 核心任务 (Tasks) ---
  {
    id: 'task_prd',
    categoryId: 'task',
    label: '需求文档 (PRD)',
    content: '请为 {{product_name}} 撰写一份标准的产品需求文档 (PRD)。\n\n### 1. 项目背景与价值\n{{background}}\n\n### 2. 目标用户与场景\n{{users}} \n\n### 3. 核心功能 (Functional)\n- **功能点 1**: {{feature1}}\n- **功能点 2**: {{feature2}}\n\n### 4. AI 技术策略\n请详细说明模型选择、Prompt 工程策略或数据流向。\n\n### 5. 验收标准\n{{metrics}}',
    description: '能够体现 AI 产品经理专业度的 PRD 模板',
  },
  {
    id: 'task_code_gen',
    categoryId: 'task',
    label: '代码生成',
    content: '编写一个 {{language|Python|TypeScript|React}} 脚本来实现以下目标：{{goal}}。\n\n要求：\n1. 代码需包含 {{feature|错误处理|详细注释|单元测试}}。\n2. 遵循最佳实践。',
  },
  {
    id: 'task_code_review',
    categoryId: 'task',
    label: '代码审查',
    content: '请审查以下代码：\n\n{{code}}\n\n请重点关注：{{focus|安全性|性能瓶颈|可读性|逻辑漏洞}}，并提供优化后的版本。',
  },
  {
    id: 'task_email',
    categoryId: 'task',
    label: '商务邮件',
    content: '请帮我写一封发给 {{recipient}} 的邮件。\n主题：{{subject}}\n目的：{{purpose}}\n语气：{{tone|诚恳|强硬|礼貌|紧急}}。',
  },
  {
    id: 'task_midjourney',
    categoryId: 'task',
    label: 'AI 绘图',
    content: '/imagine prompt: {{subject}} in the style of {{style|Cyberpunk|Studio Ghibli|Oil Painting|Realistic}}, lighting is {{lighting|Cinematic|Natural|Neon}}, {{view|Wide angle|Close up}} shot --v 6.0',
  },

  // --- 高级思维与上下文 (Context / CoT) ---
  {
    id: 'ctx_cot',
    categoryId: 'context',
    label: '思维链 (CoT)',
    content: '为了解决 "{{problem}}" 这个问题，请严格遵循以下思考步骤：\n\n1. {{step1|分析核心痛点|拆解问题背景}}\n2. {{step2|列出所有可能的方案|分析相关数据}}\n3. {{step3|评估方案优劣|推导逻辑链条}}\n4. 结论：{{step4|给出最终建议|总结关键发现}}',
    description: '逻辑更加灵活的思维链，支持自定义思考步骤。'
  },
  {
    id: 'ctx_framework',
    categoryId: 'context',
    label: '分析框架',
    content: '请使用 {{model|SWOT分析法|第一性原理|5W1H|金字塔原理}} 来分析这个问题。确保你的论证逻辑严密，并涵盖 {{aspect|商业价值|技术可行性|用户体验}} 方面。',
  },
  {
    id: 'ctx_constraints',
    categoryId: 'context',
    label: '限制条件',
    content: '严格遵守以下规则：\n1. 禁止提及 {{forbidden}}。\n2. 回复长度控制在 {{length|200字以内|500字左右|不限}}。\n3. 输出必须包含 {{requirement|数据来源|代码示例|引用文献}}。',
  },

  // --- 输出格式 (Format) ---
  {
    id: 'fmt_json',
    categoryId: 'format',
    label: 'JSON 结构化',
    content: '请输出纯 JSON 格式，不要包含 Markdown 标记。结构如下：\n{\n  "{{key1|title}}": "...",\n  "{{key2|content}}": "..."\n}',
  },
  {
    id: 'fmt_markdown_table',
    categoryId: 'format',
    label: 'Markdown 表格',
    content: '请整理为 Markdown 表格。表头包含：{{columns|姓名, 年龄, 职业|功能, 优点, 缺点|时间, 事件, 备注}}。',
  }
];