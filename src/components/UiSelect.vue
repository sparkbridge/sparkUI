<template>
    <div class="custom-select" tabindex="0" @blur="isOpen = false" :style="{ width: width }">
        <div class="select-trigger" :class="{ 'is-open': isOpen, 'is-focus': isOpen }" @click="isOpen = !isOpen">
            <span class="selected-text">{{ currentLabel }}</span>
            <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
        </div>

        <transition name="fade-down">
            <ul class="options-menu" v-show="isOpen">
                <li v-for="opt in options" :key="opt.value" class="option-item"
                    :class="{ 'is-active': opt.value === modelValue }" @click="handleSelect(opt.value)">
                    {{ opt.label }}
                </li>
            </ul>
        </transition>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    modelValue: { type: [String, Number], required: true },
    options: { type: Array, required: true }, // 格式: [{ label: '群组 ID', value: 'groupId' }]
    width: { type: String, default: 'auto' }
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);

// 计算当前选中的文字标签
const currentLabel = computed(() => {
    const target = props.options.find(opt => opt.value === props.modelValue);
    return target ? target.label : '请选择';
});

const handleSelect = (val) => {
    emit('update:modelValue', val);
    isOpen.value = false; // 选完自动关闭
};
</script>

<style scoped>
.custom-select {
    position: relative;
    outline: none;
    /* 隐藏获取焦点时的默认黑框 */
    font-size: 13px;
}

.custom-select:focus-within {
    z-index: 999;
}

/* 触发器（假装自己是个 input） */
.select-trigger {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 8px 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 36px;
    box-sizing: border-box;
}

.select-trigger:hover {
    background-color: #ffffff;
    border-color: #cbd5e1;
}

.select-trigger.is-focus {
    background-color: #ffffff;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.selected-text {
    color: #334155;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 8px;
}

.arrow-icon {
    width: 14px;
    height: 14px;
    color: #94a3b8;
    transition: transform 0.3s ease;
    flex-shrink: 0;
}

.select-trigger.is-open .arrow-icon {
    transform: rotate(180deg);
}

/* 弹出菜单（你心心念念的圆角阴影框） */
.options-menu {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    min-width: 100%;
    margin: 0;
    padding: 6px;
    background: #ffffff;
    border: 1px solid #f1f5f9;
    border-radius: 12px;
    /* 完美的圆角 */
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
    list-style: none;
    z-index: 100;
    /* 确保悬浮在最上层 */
    max-height: 200px;
    overflow-y: auto;
}

/* 自定义滚动条 */
.options-menu::-webkit-scrollbar {
    width: 4px;
}

.options-menu::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 4px;
}

/* 选项条目 */
.option-item {
    padding: 8px 12px;
    border-radius: 8px;
    /* 内部条目也有圆角 */
    color: #475569;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
}

.option-item:hover {
    background-color: #f1f5f9;
    color: #1e293b;
}

/* 选中状态 */
.option-item.is-active {
    background-color: #eff6ff;
    color: #3b82f6;
    font-weight: 600;
}

/* 优雅的弹出动画 */
.fade-down-enter-active,
.fade-down-leave-active {
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-down-enter-from,
.fade-down-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}
</style>