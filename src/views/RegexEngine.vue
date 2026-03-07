<template>
    <div class="regex-engine-view">
        <header class="page-header">
            <div class="header-left">
                <div class="icon-box">
                    <Settings2Icon :size="24" />
                </div>
                <div class="title-info">
                    <h1>自动化规则引擎</h1>
                    <p>统一管理消息正则匹配与群管/系统事件监听，构建自动化工作流。</p>
                </div>
            </div>
            <button class="btn-primary add-rule-btn" @click="addNewRule">
                <PlusIcon :size="18" /> 新建规则
            </button>
        </header>

        <div class="rule-list">
            <div v-for="(rule, index) in rules" :key="rule.id" class="glass-card rule-card"
                :class="{ 'disabled': !rule.enabled }">

                <div class="rule-header">
                    <div class="header-left-controls">
                        <label class="switch-ui">
                            <input type="checkbox" v-model="rule.enabled" />
                            <span class="slider"></span>
                        </label>

                        <div class="type-toggle">
                            <button :class="{ active: rule.triggerType === 'message' }"
                                @click="rule.triggerType = 'message'">
                                <MessageSquareIcon :size="14" /> 消息正则
                            </button>
                            <button :class="{ active: rule.triggerType === 'event' }"
                                @click="rule.triggerType = 'event'">
                                <BellIcon :size="14" /> 系统事件
                            </button>
                        </div>
                    </div>

                    <div class="header-right-controls">
                        <input type="text" v-model="rule.name" class="name-input" placeholder="输入规则名称..." />
                        <button class="btn-icon delete-btn" @click="deleteRule(index)" title="删除此规则">
                            <Trash2Icon :size="18" />
                        </button>
                    </div>
                </div>

                <div v-if="rule.triggerType === 'message'" class="section-block regex-block">
                    <div class="block-title">
                        <TextCursorInputIcon :size="14" /> 匹配表达式 (Pattern)
                    </div>
                    <div class="regex-input-group">
                        <span class="regex-slash">/</span>
                        <input type="text" v-model="rule.pattern" class="regex-pattern" placeholder="例如: ^点歌\s+(.+)$" />
                        <span class="regex-slash">/</span>
                        <input type="text" v-model="rule.flags" class="regex-flags" placeholder="igm" maxlength="3" />
                    </div>
                </div>

                <div v-if="rule.triggerType === 'event'" class="section-block event-block">
                    <div class="block-title">
                        <BellRingIcon :size="14" /> 监听事件类型 (Event Hook)
                    </div>
                    <UiSelect v-model="rule.eventType" :options="eventOptions" width="100%" class="event-ui-select" />
                </div>

                <div class="split-grid">

                    <div class="section-block condition-block">
                        <div class="block-title space-between">
                            <span>
                                <FilterIcon :size="14" /> 过滤条件 (满足以下全部)
                            </span>
                            <button class="btn-text" @click="addCondition(rule)">
                                <PlusIcon :size="14" /> 添加
                            </button>
                        </div>
                        <div v-if="rule.conditions.length === 0" class="empty-tip">无条件限制，触发即执行</div>
                        <div class="list-rows">
                            <div v-for="(cond, cIdx) in rule.conditions" :key="cond.id" class="list-row">
                                <UiSelect v-model="cond.field" :options="fieldOptions" width="110px" />
                                <UiSelect v-model="cond.operator" :options="operatorOptions" width="90px" />

                                <input type="text" v-model="cond.value" class="ui-input" placeholder="比较值..." />
                                <button class="btn-del-small" @click="rule.conditions.splice(cIdx, 1)">
                                    <XIcon :size="14" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="section-block action-block">
                        <div class="block-title space-between">
                            <span>
                                <ZapIcon :size="14" /> 执行动作 (按顺序执行)
                            </span>
                            <button class="btn-text" @click="addAction(rule)">
                                <PlusIcon :size="14" /> 添加
                            </button>
                        </div>
                        <div v-if="rule.actions.length === 0" class="empty-tip">未配置任何执行动作</div>
                        <div class="list-rows">
                            <div v-for="(act, aIdx) in rule.actions" :key="act.id" class="list-row">
                                <UiSelect v-model="act.type" :options="actionOptions" width="130px" />

                                <input type="text" v-model="act.params" class="ui-input" placeholder="参数 (支持内置变量)..." />
                                <button class="btn-del-small" @click="rule.actions.splice(aIdx, 1)">
                                    <XIcon :size="14" />
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>

        <div class="bottom-action-bar">
            <span class="stat-text">共加载了 {{ rules.length }} 条自动化规则</span>
            <button class="btn-save" @click="saveRules">
                <SaveIcon :size="16" /> 保存配置
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref,onMounted } from 'vue';
import {
    Settings2Icon, PlusIcon, Trash2Icon, TextCursorInputIcon,
    FilterIcon, ZapIcon, XIcon, SaveIcon, MessageSquareIcon, BellIcon, BellRingIcon
} from 'lucide-vue-next';
import { api } from '../api';
// 引入我们刚刚封装好的完美下拉框组件
import UiSelect from '../components/UiSelect.vue';
import { showNotice } from '../utils/notice';

// ==============================
// 1. 下拉框选项数据定义
// ==============================

const eventOptions = [
    { label: '🟢 群成员增加 (进群/被邀请)', value: 'group.member_join' },
    { label: '🔴 群成员减少 (退群/被踢)', value: 'group.member_leave' },
    // { label: '🛡️ 管理员变更 (升管/降管)', value: 'group.admin_change' },
    // { label: '👋 好友添加请求', value: 'request.friend' },
    { label: '⚙️ 机器人生命周期 (上线)', value: 'system.lifecycle' },
    {label: '💬 服务器玩家发言', value: 'server.player_chat'},
    {label: '🏃‍ 玩家进入服务器',value:'server.player_join'},
    {label: '🏃‍ 玩家退出服务器',value:'server.player_quit'},
];

const fieldOptions = [
    { label: '群组 ID', value: 'groupId' },
    { label: '用户 ID', value: 'userId' },
    { label: '用户权限', value: 'userRole' }
];

const operatorOptions = [
    { label: '等于 (==)', value: '==' },
    { label: '不等于 (!=)', value: '!=' },
    { label: '正则匹配', value: 'matches' }
];

const actionOptions = [
    { label: '发送消息', value: 'replyText' },
    { label: '撤回消息', value: 'deleteMessage' },
    { label: '禁言用户', value: 'muteUser' },
    {label:'执行命令', value:'executeCommand'}
];


// ==============================
// 2. 页面状态与逻辑
// ==============================

const rules = ref([]);
const isSaving = ref(false);
const loadRules = async () => {
    try {
        const res = await api.getRegexRules();
        // console.log('获取到的数据:', res.data);
        // 赋值给 .value
        rules.value = res.data;
    } catch (error) {
        console.error('获取规则失败:', error);
        showNotice('获取规则失败', "error");
    }
};

onMounted(() => {
    loadRules();
});


const generateId = () => Math.random().toString(36).substr(2, 9);

const addNewRule = () => {
    rules.value.unshift({
        id: generateId(), name: '新建规则', enabled: true, triggerType: 'message',
        pattern: '', flags: 'i', eventType: 'group.member_join', conditions: [], actions: []
    });
};

const deleteRule = (index) => rules.value.splice(index, 1);
const addCondition = (rule) => rule.conditions.push({ id: generateId(), field: 'groupId', operator: '==', value: '' });
const addAction = (rule) => rule.actions.push({ id: generateId(), type: 'replyText', params: '' });

// 优雅的保存方法
const saveRules = async () => {
    // 1. 防连点拦截
    if (isSaving.value) return;

    // 2. 开启 Loading 状态
    isSaving.value = true;

    try {
        // 3. 调用 API，注意传入的是 rules.value
        // Axios 内部会自动调用 JSON.stringify 处理 Vue 的响应式 Proxy 对象
        const res = await api.saveRegexRules(rules.value);

        // 4. 判断业务成功（如果你的拦截器没有抛出异常，通常就是成功了）
        if (res && res.code === 200) {
            // showNotice('规则配置保存成功！', 'success');
            showNotice('规则配置保存成功！',"success"); // 如果还没写 showNotice，先用 alert 代替
        }
    } catch (error) {
        // 错误通常已经在你的 request.js 拦截器里处理并弹窗了
        // 这里只需打印一下日志方便调试
        console.error('保存规则失败:', error);
    } finally {
        // 5. 无论成功还是失败，最后一定要解除 Loading 锁
        isSaving.value = false;
    }
};
</script>

<style scoped>
/* 基础与动画样式同前 */
.regex-engine-view {
    display: flex;
    flex-direction: column;
    gap: 24px;
    animation: fadeIn 0.4s ease;
    padding-bottom: 80px;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    padding: 24px 32px;
    border-radius: 20px;
    border: 1px solid #eef2f6;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 16px;
}

.icon-box {
    width: 48px;
    height: 48px;
    background: #eff6ff;
    color: #3b82f6;
    border-radius: 14px;
    display: grid;
    place-items: center;
}

.title-info h1 {
    margin: 0;
    font-size: 20px;
    color: #1e293b;
}

.title-info p {
    margin: 4px 0 0;
    font-size: 13px;
    color: #94a3b8;
}

button {
    border: none;
    outline: none;
    cursor: pointer;
    transition: 0.2s;
    font-family: inherit;
}

.btn-primary {
    background: #3b82f6;
    color: white;
    padding: 10px 20px;
    border-radius: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
}

.btn-primary:hover {
    background: #2563eb;
    transform: translateY(-2px);
}

.btn-icon {
    background: transparent;
    color: #94a3b8;
    padding: 8px;
    border-radius: 8px;
}

.btn-icon:hover {
    background: #fee2e2;
    color: #ef4444;
}

.rule-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.glass-card {
    background: #ffffff;
    border-radius: 24px;
    padding: 24px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
    transition: 0.3s;
}

.rule-card.disabled {
    opacity: 0.6;
    filter: grayscale(0.8);
}

/* --- 新增：规则头部排版优化 --- */
.rule-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f8fafc;
}

.header-left-controls {
    display: flex;
    align-items: center;
    gap: 24px;
}

.header-right-controls {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    justify-content: flex-end;
}

.switch-ui {
    position: relative;
    width: 44px;
    height: 24px;
    cursor: pointer;
}

.switch-ui input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    inset: 0;
    background: #e2e8f0;
    border-radius: 34px;
    transition: 0.3s;
}

.slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background: white;
    border-radius: 50%;
    transition: 0.3s;
}

input:checked+.slider {
    background: #3b82f6;
}

input:checked+.slider:before {
    transform: translateX(20px);
}

/* --- 新增：触发器类型切换药丸 (Pill Toggle) --- */
.type-toggle {
    display: flex;
    background: #f1f5f9;
    border-radius: 10px;
    padding: 4px;
}

.type-toggle button {
    background: transparent;
    border: none;
    color: #64748b;
    font-size: 12px;
    font-weight: 700;
    padding: 6px 12px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.type-toggle button:hover {
    color: #1e293b;
}

.type-toggle button.active {
    background: white;
    color: #3b82f6;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.name-input {
    font-size: 16px;
    font-weight: 700;
    color: #1e293b;
    border: none;
    outline: none;
    background: transparent;
    width: 200px;
    text-align: right;
    padding: 6px 12px;
    border-radius: 8px;
    transition: 0.2s;
}

.name-input:focus {
    background: #f8fafc;
}

/* 区块通用 */
.section-block {
    background: #f8fafc;
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 16px;
    border: 1px solid #f1f5f9;
}

.block-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 700;
    color: #64748b;
    margin-bottom: 12px;
}

.space-between {
    justify-content: space-between;
}

.btn-text {
    background: transparent;
    color: #3b82f6;
    font-size: 12px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 6px;
}

.btn-text:hover {
    background: #eff6ff;
}

/* 正则与事件选择器 */
.regex-input-group {
    display: flex;
    align-items: center;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 0 12px;
    overflow: hidden;
}

.regex-input-group:focus-within {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.regex-slash {
    color: #cbd5e1;
    font-weight: 800;
    font-size: 18px;
    user-select: none;
}

.regex-pattern {
    flex: 1;
    border: none;
    outline: none;
    padding: 12px;
    font-family: 'Fira Code', monospace;
    font-size: 14px;
    color: #3b82f6;
    font-weight: 600;
}

.regex-flags {
    width: 50px;
    border: none;
    outline: none;
    padding: 12px 0;
    font-family: 'Fira Code', monospace;
    font-size: 14px;
    color: #ef4444;
    font-weight: 600;
    text-align: center;
}

/* --- 新增：事件专属区块样式 --- */
.event-block {
    background: #fdf4ff;
    border-color: #fae8ff;
}

.event-block .block-title {
    color: #c026d3;
}

.full-width-select {
    width: 100%;
    padding: 12px;
    border-radius: 12px;
    background: white;
    border: 1px solid #f0abfc;
    color: #a21caf;
    font-weight: 600;
    font-size: 14px;
}

/* 左右分栏 */
.split-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 0;
}

.condition-block,
.action-block {
    margin-bottom: 0;
    background: #ffffff;
    border-color: #e2e8f0;
}

.action-block {
    background: #eff6ff;
    border-color: #dbeafe;
}

.action-block .block-title {
    color: #3b82f6;
}

/* 动态列表行 */
.empty-tip {
    font-size: 12px;
    color: #94a3b8;
    text-align: center;
    padding: 16px 0;
    font-style: italic;
}

.list-rows {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.list-row {
    display: flex;
    gap: 8px;
    align-items: center;
}

.ui-select {
    /* 1. 清除浏览器原生样式 */
    appearance: none;
    -webkit-appearance: none;

    /* 2. 基础拟态背景与圆角 */
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;

    /* 3. 自定义下拉箭头 (使用 Data URI 嵌入 SVG，纯粹且不发请求) */
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 10px center;
    background-size: 14px;

    /* 4. 排版与间距 (右侧 padding 给箭头留出空间) */
    padding: 8px 32px 8px 12px;
    font-size: 13px;
    font-weight: 500;
    color: #334155;
    outline: none;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    text-overflow: ellipsis;
}

/* 悬浮状态：提亮背景，加深边框 */
.ui-select:hover {
    background-color: #ffffff;
    border-color: #cbd5e1;
}

/* 聚焦/激活状态：融入主题蓝，增加呼吸光环 */
.ui-select:focus {
    background-color: #ffffff;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.op-select {
    width: 80px;
}

.action-select {
    width: 120px;
    font-weight: 600;
    color: #3b82f6;
}

.full-width-select {
    width: 100%;
    padding: 12px 16px;
    border-radius: 12px;
    background-color: #fdf4ff;
    border: 1px solid #f0abfc;
    color: #a21caf;
    font-weight: 600;
    font-size: 14px;
}

.full-width-select:focus {
    border-color: #d946ef;
    box-shadow: 0 0 0 3px rgba(217, 70, 239, 0.15);
}

.ui-input {
    flex: 1;
    min-width: 0;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 12px;
    outline: none;
}

.ui-input:focus


.btn-del-small {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: white;
    color: #94a3b8;
    display: grid;
    place-items: center;
    border: 1px solid #e2e8f0;
    flex-shrink: 0;
}

.btn-del-small:hover {
    border-color: #fca5a5;
    color: #ef4444;
    background: #fef2f2;
}

/* 底部操作条 */
.bottom-action-bar {
    position: fixed;
    bottom: 0;
    right: 0;
    width: calc(100% - 260px);
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(12px);
    border-top: 1px solid #e2e8f0;
    padding: 16px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 100;
}

.stat-text {
    font-size: 13px;
    color: #64748b;
    font-weight: 600;
}

.btn-save {
    background: #1e293b;
    color: white;
    padding: 12px 24px;
    border-radius: 12px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(30, 41, 59, 0.2);
}

.btn-save:hover {
    background: #0f172a;
    transform: translateY(-2px);
}

@media (max-width: 1024px) {
    .split-grid {
        grid-template-columns: 1fr;
    }

    .bottom-action-bar {
        width: 100%;
    }
}
</style>