# 筛选卡片组件实现计划

## [x] 任务 1：创建筛选卡片组件
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 在 `src/components` 目录下创建 `SentenceFilterCard.vue` 组件
  - 将现有的筛选逻辑和UI从 `Sentences.vue` 提取到新组件中
  - 保持所有功能完整性
- **Success Criteria**:
  - 组件成功创建并包含所有筛选UI元素
  - 组件可以正确接收和传递props
- **Test Requirements**:
  - `programmatic` TR-1.1: 组件文件成功创建在正确位置 ✓
  - `human-judgement` TR-1.2: 组件代码结构清晰，符合Vue 3 + TypeScript规范 ✓

## [x] 任务 2：实现组件Props和Events
- **Priority**: P0
- **Depends On**: Task 1
- **Description**:
  - 定义组件的props接口（筛选条件、分类列表等）
  - 定义组件的emits（筛选变更、清除筛选等事件）
  - 确保父子组件之间的数据通信正常
- **Success Criteria**:
  - 所有必要的props正确定义
  - 所有事件正确emit
- **Test Requirements**:
  - `programmatic` TR-2.1: TypeScript类型定义完整且无错误 ✓
  - `human-judgement` TR-2.2: 组件接口设计合理，易于使用 ✓

## [x] 任务 3：优化卡片样式和布局
- **Priority**: P1
- **Depends On**: Task 1
- **Description**:
  - 实现现代卡片式设计（边框、阴影、内边距）
  - 统一配色方案，与整体页面风格一致
  - 合理设置筛选条件之间的间距和排列
  - 添加悬停效果和交互反馈
- **Success Criteria**:
  - 视觉效果美观，与页面其他元素协调
  - 交互反馈明显且流畅
- **Test Requirements**:
  - `human-judgement` TR-3.1: 卡片设计现代化，视觉层次清晰 ✓
  - `human-judgement` TR-3.2: 悬停和点击效果良好 ✓

## [x] 任务 4：实现响应式设计
- **Priority**: P1
- **Depends On**: Task 3
- **Description**:
  - 实现完全自适应的布局（文字大小、间距）
  - 在不同屏幕尺寸下保持良好显示效果
  - 移动端考虑使用折叠面板或滚动容器
  - 使用媒体查询优化各断点下的显示
- **Success Criteria**:
  - 在移动端、平板、桌面端均能正常使用
  - 小屏幕下空间利用合理
- **Test Requirements**:
  - `human-judgement` TR-4.1: 在移动端（<768px）显示正常 ✓
  - `human-judgement` TR-4.2: 在平板（768px-1024px）显示正常 ✓
  - `human-judgement` TR-4.3: 在桌面端（>1024px）显示正常 ✓

## [x] 任务 5：集成到Sentences.vue
- **Priority**: P0
- **Depends On**: Task 2
- **Description**:
  - 在Sentences.vue中引入并使用新的筛选卡片组件
  - 传递必要的props和监听事件
  - 确保功能完全正常
- **Success Criteria**:
  - 组件成功集成
  - 所有筛选功能正常工作
- **Test Requirements**:
  - `programmatic` TR-5.1: 组件正确导入和使用 ✓
  - `programmatic` TR-5.2: 所有筛选功能（搜索、分类、状态）正常 ✓
  - `human-judgement` TR-5.3: 整体用户体验流畅 ✓

## [x] 任务 6：完整测试和验证
- **Priority**: P0
- **Depends On**: Task 5
- **Description**:
  - 全面测试所有筛选功能
  - 测试响应式布局
  - 测试性能
  - 构建验证
- **Success Criteria**:
  - 所有功能正常工作
  - 构建无错误
- **Test Requirements**:
  - `programmatic` TR-6.1: `npm run build` 成功通过 ✓
  - `human-judgement` TR-6.2: 所有筛选操作流畅无卡顿 ✓
