# 句子管理页面功能增强 - 实施计划

## [x] Task 1: 添加"更新时间"字段
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 在表格中添加"更新时间"列
  - 确保格式和样式与"创建时间"一致
  - 检查 API 数据是否包含 updated_at 字段
- **Success Criteria**: 更新时间字段正确显示，格式和样式与创建时间一致
- **Test Requirements**:
  - `programmatic` TR-1.1: 表格中正确渲染更新时间列
  - `human-judgement` TR-1.2: 样式与创建时间列完全一致
- **Notes**: 使用与创建时间相同的 formatDate 函数

## [x] Task 2: 实现排序功能
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 为创建时间和更新时间列添加排序功能
  - 支持升序和降序两种方式
  - 在界面上显示清晰的排序状态指示
- **Success Criteria**: 排序功能正常工作，状态指示清晰
- **Test Requirements**:
  - `programmatic` TR-2.1: 点击列标题可以正确排序
  - `programmatic` TR-2.2: 升序和降序状态正确切换
  - `human-judgement` TR-2.3: 排序指示清晰可见
- **Notes**: 使用 Element Plus 表格的 sortable 属性

## [x] Task 3: 实现时间范围筛选
- **Priority**: P1
- **Depends On**: None
- **Description**: 
  - 添加开始时间和结束时间的日期选择器
  - 支持基于创建时间和更新时间的时间范围筛选
  - 提供清除时间筛选的功能
- **Success Criteria**: 时间范围筛选功能正常工作
- **Test Requirements**:
  - `programmatic` TR-3.1: 日期选择器正确渲染
  - `programmatic` TR-3.2: 时间范围筛选逻辑正确
  - `human-judgement` TR-3.3: 交互体验流畅
- **Notes**: 使用 el-date-picker 组件

## [x] Task 4: 实现句子状态筛选
- **Priority**: P1
- **Depends On**: None
- **Description**: 
  - 添加状态筛选控件（正常/禁用/全部）
  - 支持单选筛选模式
  - 与现有筛选条件兼容
- **Success Criteria**: 状态筛选功能正常工作
- **Test Requirements**:
  - `programmatic` TR-4.1: 状态筛选控件正确渲染
  - `programmatic` TR-4.2: 筛选逻辑正确
  - `human-judgement` TR-4.3: 与其他筛选条件兼容
- **Notes**: 使用 el-select 或 el-radio-group

## [x] Task 5: 实现多条件联合筛选
- **Priority**: P0
- **Depends On**: Tasks 3-4
- **Description**: 
  - 确保时间筛选和状态筛选能组合使用
  - 与搜索和分类筛选兼容
  - 提供清除所有筛选条件的功能
- **Success Criteria**: 所有筛选条件能联合使用
- **Test Requirements**:
  - `programmatic` TR-5.1: 多种筛选条件同时应用
  - `programmatic` TR-5.2: 筛选逻辑正确组合
  - `human-judgement` TR-5.3: 清除功能正常工作
- **Notes**: 重构 loadSentences 函数以支持所有筛选条件

## [x] Task 6: 实现筛选状态记忆功能
- **Priority**: P1
- **Depends On**: Tasks 3-5
- **Description**: 
  - 使用 localStorage 保存筛选条件
  - 页面刷新或返回时恢复筛选条件
  - 提供重置为默认状态的选项
- **Success Criteria**: 筛选状态正确保存和恢复
- **Test Requirements**:
  - `programmatic` TR-6.1: 筛选条件保存到 localStorage
  - `programmatic` TR-6.2: 页面刷新后恢复筛选条件
  - `human-judgement` TR-6.3: 记忆功能流畅自然
- **Notes**: 与搜索历史类似的实现方式

## [x] Task 7: 优化筛选交互体验
- **Priority**: P1
- **Depends On**: Tasks 3-6
- **Description**: 
  - 提供明确的视觉反馈显示筛选条件应用状态
  - 显示符合当前筛选条件的句子数量统计
  - 添加筛选条件标签，显示当前应用的所有筛选
- **Success Criteria**: 筛选交互体验优化完成
- **Test Requirements**:
  - `programmatic` TR-7.1: 筛选条件标签正确显示
  - `programmatic` TR-7.2: 数量统计正确
  - `human-judgement` TR-7.3: 整体体验良好
- **Notes**: 使用 el-tag 显示当前筛选条件

## [x] Task 8: 完整测试和构建验证
- **Priority**: P0
- **Depends On**: Tasks 1-7
- **Description**: 
  - 完整功能测试
  - 所有功能联合测试
  - 构建和部署验证
- **Success Criteria**: 所有功能正常工作，构建无错误
- **Test Requirements**:
  - `programmatic` TR-8.1: 构建无错误
  - `programmatic` TR-8.2: 所有功能正常
  - `human-judgement` TR-8.3: 整体体验良好
- **Notes**: 彻底测试所有功能
