<template>
    <teleport to="body">
        <transition name="modal-fade">
            <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
                <div class="modal-card">
                    <header class="modal-header">
                        <div class="header-title">
                            <div class="header-icon">
                                <SettingsIcon :size="20" />
                            </div>
                            <div class="header-text">
                                <h3>配置: {{ schema.name }}</h3>
                                <p>管理参数与动态规则列表</p>
                            </div>
                        </div>
                        <button class="close-btn" @click="$emit('close')">
                            <XIcon :size="20" />
                        </button>
                    </header>

                    <div class="modal-body">
                        <div v-for="item in schema.items" :key="item.key" class="config-row"
                            :class="{ 'align-start': item.type === 'editArray' }">
                            <div class="field-meta">
                                <span class="field-label">{{ item.desc }}</span>
                                <code class="field-key">{{ item.key }}</code>
                            </div>

                            <div class="field-control">

                                <div v-if="item.type === 'editArray'" class="array-editor">
                                    <div class="array-list">
                                        <div v-for="(str, idx) in formData[item.key]" :key="idx" class="array-tag">
                                            <span>{{ str }}</span>
                                            <button @click="removeItem(item.key, idx)" class="tag-del-btn">
                                                <MinusIcon :size="12" />
                                            </button>
                                        </div>
                                        <div v-if="!formData[item.key] || formData[item.key].length === 0"
                                            class="empty-tip">暂无数据</div>
                                    </div>
                                    <div class="array-input-group">
                                        <input type="text" v-model="newInputs[item.key]" placeholder="输入内容并回车..."
                                            @keyup.enter="addItem(item.key)" />
                                        <button @click="addItem(item.key)" class="add-btn">
                                            <PlusIcon :size="18" />
                                        </button>
                                    </div>
                                </div>

                                <div v-else-if="item.type === 'choose'" class="segmented-control">
                                    <label v-for="(option, index) in item.options" :key="index" class="segment-item"
                                        :class="{ active: formData[item.key] === index }">
                                        <input type="radio" :value="index" v-model="formData[item.key]"
                                            class="real-radio" />
                                        <span class="segment-label">{{ option }}</span>
                                    </label>
                                </div>

                                <div v-else-if="item.type === 'switch'" class="switch-wrapper">
                                    <label class="switch-ui">
                                        <input type="checkbox" v-model="formData[item.key]" />
                                        <span class="slider"></span>
                                    </label>
                                </div>

                                <input v-else type="text" v-model="formData[item.key]" class="text-input"
                                    placeholder="请输入内容..." />

                            </div>
                        </div>
                    </div>

                    <footer class="modal-footer">
                        <button class="btn-cancel" @click="$emit('close')" :disabled="loading">取消</button>
                        <button class="btn-save" @click="handleSave" :disabled="loading">
                            <span v-if="!loading">保存修改</span>
                            <span v-else class="loader"></span>
                        </button>
                    </footer>
                </div>
            </div>
        </transition>
    </teleport>
</template>

<script setup>
import { ref, watch, reactive } from 'vue';
import { SettingsIcon, XIcon, PlusIcon, MinusIcon } from 'lucide-vue-next';

const props = defineProps({
    isOpen: Boolean,
    schema: Object,
    loading: Boolean
});

const emit = defineEmits(['close', 'save']);

const formData = ref({});
const newInputs = reactive({}); // 存储各个数组输入框的临时文字

// 弹窗打开时初始化数据
watch(() => props.isOpen, (val) => {
    if (val && props.schema?.items) {
        const data = {};
        props.schema.items.forEach(i => {
            if (i.type === 'editArray') {
                // 关键修复：从 i.val 读取初始数组
                data[i.key] = Array.isArray(i.val) ? [...i.val] : [];
                newInputs[i.key] = '';
            } else {
                data[i.key] = i.val;
            }
        });
        formData.value = data;
    }
});

// 数组添加逻辑
const addItem = (key) => {
    const text = newInputs[key]?.trim();
    if (text) {
        const currentList = Array.isArray(formData.value[key]) ? formData.value[key] : [];
        // 关键修复：通过展开运算符创建新数组，强制触发 Vue 响应式更新
        formData.value[key] = [...currentList, text];
        newInputs[key] = '';
    }
};

// 数组删除逻辑
const removeItem = (key, index) => {
    formData.value[key].splice(index, 1);
};

// 提交逻辑
const handleSave = () => {
    console.log('formData.value:', formData.value);
    emit('save', { ...formData.value });
};
</script>

<style scoped>
/* 1. 彻底抹除原生按钮边框 */
button {
    border: none !important;
    outline: none !important;
    background: none;
    cursor: pointer;
    padding: 0;
}

/* 2. 遮罩层与动画 */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: all 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
    transform: scale(0.95);
}

/* 3. 卡片布局 */
.modal-card {
    background: white;
    width: 92%;
    max-width: 540px;
    border-radius: 28px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
    overflow: hidden;
}

.modal-header {
    padding: 24px 32px;
    border-bottom: 1px solid #f1f5f9;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-title {
    display: flex;
    align-items: center;
    gap: 16px;
}

.header-icon {
    width: 40px;
    height: 40px;
    background: #eff6ff;
    color: #3b82f6;
    border-radius: 12px;
    display: grid;
    place-items: center;
}

.header-text h3 {
    margin: 0;
    font-size: 17px;
    color: #1e293b;
}

.header-text p {
    margin: 2px 0 0;
    font-size: 12px;
    color: #94a3b8;
}

.close-btn {
    color: #94a3b8;
}

.modal-body {
    padding: 32px;
    max-height: 500px;
    overflow-y: auto;
}

.config-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    gap: 24px;
}

.config-row.align-start {
    align-items: flex-start;
}

.field-meta {
    flex: 1;
    min-width: 0;
}

.field-label {
    font-size: 14px;
    font-weight: 600;
    color: #334155;
    line-height: 1.4;
}

.field-key {
    font-size: 11px;
    color: #94a3b8;
    font-family: monospace;
}

/* 4. 数组编辑器样式 */
.array-editor {
    width: 280px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.array-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    background: #f8fafc;
    padding: 12px;
    border-radius: 14px;
    border: 1px solid #e2e8f0;
    min-height: 48px;
}

.array-tag {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #eff6ff;
    color: #3b82f6;
    padding: 5px 12px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;
}

.tag-del-btn {
    color: #3b82f6;
    opacity: 0.6;
    display: flex;
}

.tag-del-btn:hover {
    color: #ef4444;
    opacity: 1;
}

.empty-tip {
    font-size: 12px;
    color: #cbd5e1;
    width: 100%;
    text-align: center;
}

.array-input-group {
    display: flex;
    gap: 8px;
}

.array-input-group input {
    flex: 1;
    background: white;
    border: 1px solid #e2e8f0;
    padding: 10px 14px;
    border-radius: 12px;
    font-size: 13px;
    outline: none;
    transition: 0.2s;
}

.array-input-group input:focus {
    border-color: #3b82f6;
}

.add-btn {
    width: 40px;
    height: 40px;
    background: #3b82f6;
    color: white;
    border-radius: 12px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
}

/* 5. 核心修复：单选框去圆点 */
.segmented-control {
    display: flex;
    flex-wrap: wrap;
    background: #f1f5f9;
    padding: 4px;
    border-radius: 12px;
    gap: 4px;
    max-width: 260px;
    justify-content: flex-end;
}

.segment-item {
    position: relative;
    cursor: pointer;
    flex: 1 1 auto;
}

.real-radio {
    display: none;
}

/* 彻底隐藏原生单选框 */
.segment-label {
    display: block;
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    color: #64748b;
    text-align: center;
    transition: 0.2s;
}

.segment-item.active .segment-label {
    background: white;
    color: #3b82f6;
    box-shadow: 0 2px 6px rgba(59, 130, 246, 0.1);
}

/* 6. 核心修复：开关防变形 */
.switch-wrapper {
    flex-shrink: 0;
    width: 44px;
    display: flex;
    justify-content: flex-end;
}

.switch-ui {
    position: relative;
    width: 44px;
    height: 22px;
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
    height: 16px;
    width: 16px;
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
    transform: translateX(22px);
}

/* 7. 基础控件样式 */
.text-input {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 10px 14px;
    border-radius: 12px;
    font-size: 13px;
    width: 220px;
    outline: none;
}

.text-input:focus {
    border-color: #3b82f6;
    background: white;
}

.modal-footer {
    padding: 24px 32px;
    background: #f8fafc;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.btn-save {
    background: #3b82f6;
    color: white;
    padding: 12px 28px;
    border-radius: 14px;
    font-weight: 600;
}

.btn-cancel {
    color: #64748b;
    font-weight: 600;
    padding: 12px 24px;
}

/* 8. 响应式布局补丁 (移动端堆叠) */
@media (max-width: 640px) {
    .modal-card {
        width: 95%;
        max-height: 90vh;
    }

    .config-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }

    .field-control,
    .array-editor,
    .text-input,
    .segmented-control {
        width: 100% !important;
        max-width: none !important;
    }

    .segmented-control {
        justify-content: flex-start;
    }

    .switch-wrapper {
        justify-content: flex-start;
    }
}

.loader {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>