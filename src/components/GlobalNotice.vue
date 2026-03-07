<template>
    <transition name="slide">
        <div v-if="noticeState.show" class="global-notice" :class="noticeState.type">
            <div class="notice-icon">
                <InfoIcon v-if="noticeState.type === 'info'" :size="18" />
                <CheckCircleIcon v-if="noticeState.type === 'success'" :size="18" />
                <AlertCircleIcon v-if="noticeState.type === 'error'" :size="18" />
            </div>
            <div class="notice-content">
                {{ noticeState.message }}
            </div>
            <button class="close-btn" @click="noticeState.show = false">
                <XIcon :size="14" />
            </button>
        </div>
    </transition>
</template>

<script setup>
import { noticeState } from '../utils/notice';
import { InfoIcon, CheckCircleIcon, AlertCircleIcon, XIcon } from 'lucide-vue-next';
</script>

<style scoped>
.global-notice {
    position: fixed;
    top: 24px;
    right: 24px;
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    min-width: 280px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 25px rgba(59, 130, 246, 0.12);
    border: 1px solid #e0effe;
}

/* 不同类型的颜色微调 */
.info {
    border-left: 4px solid #3b82f6;
}

.success {
    border-left: 4px solid #10b981;
}

.error {
    border-left: 4px solid #ef4444;
}

.notice-icon {
    color: #3b82f6;
    display: flex;
}

.success .notice-icon {
    color: #10b981;
}

.error .notice-icon {
    color: #ef4444;
}

.notice-content {
    flex: 1;
    font-size: 14px;
    font-weight: 500;
    color: #1e293b;
}

.close-btn {
    color: #94a3b8;
    padding: 4px;
    cursor: pointer;
    transition: 0.2s;
}

.close-btn:hover {
    color: #64748b;
}

/* 动画效果：从右侧滑入 */
.slide-enter-active,
.slide-leave-active {
    transition: all 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}

.slide-enter-from {
    transform: translateX(120%);
    opacity: 0;
}

.slide-leave-to {
    transform: translateX(20px);
    opacity: 0;
}

/* GlobalNotice.vue 样式补丁 */
@media (max-width: 640px) {
    .global-notice {
        top: 12px;
        left: 12px;
        right: 12px;
        min-width: 0;
        width: calc(100% - 24px);
        padding: 12px 16px;
    }

    .slide-enter-from {
        transform: translateY(-100%);
        /* 移动端改为从顶部滑入 */
        opacity: 0;
    }
}
</style>