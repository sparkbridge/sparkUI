<template>
    <Transition name="fade">
        <div v-if="isOpen" class="modal-mask" @click="$emit('close')">
            <div class="modal-container" @click.stop>
                <div class="modal-header">
                    <div class="header-main">
                        <div class="p-icon">
                            <img v-if="plugin.icon" :src="plugin.icon" :alt="plugin.name" />
                            <span v-else class="fallback-icon">{{ plugin.name.charAt(0).toUpperCase() }}</span>
                        </div>
                        <div class="title-area">
                            <h2>{{ plugin.name }} <span class="v">v{{ plugin.version }}</span></h2>
                            <p class="author">By @{{ plugin.author }}</p>
                        </div>
                    </div>
                    <button class="close-btn" @click="$emit('close')">✕</button>
                </div>

                <div class="modal-body">
                    <div v-if="plugin.loading" class="loading-state">获取详情中...</div>
                    <template v-else>
                        <div class="stats-row">
                            <div class="stat-item">👁️ {{ plugin.views || 0 }} 查看</div>
                            <div class="stat-item">📥 {{ plugin.downloads || 0 }} 下载</div>
                            <div class="stat-item">📅 {{ new Date(plugin.createdAt).toLocaleDateString() }}</div>
                        </div>

                        <div class="content-section">
                            <h3>功能描述</h3>
                            <div class="desc-container">
                                <p class="long-desc">{{ plugin.longDesc || plugin.desc || '暂无详细描述' }}</p>
                            </div>
                        </div>

                        <div class="tags-row" v-if="plugin.tags && plugin.tags.length">
                            <span v-for="tag in plugin.tags" :key="tag" class="tag">#{{ tag }}</span>
                        </div>
                    </template>
                </div>

                <div class="modal-footer">
                    <div class="link-group">
                        <a v-if="plugin.repo" :href="plugin.repo" target="_blank" class="link-btn github-link"
                            title="查看源码仓库">
                            <GithubIcon :size="16" />
                            <span>GitHub</span>
                        </a>
                        <a v-if="plugin.docUrl" :href="plugin.docUrl" target="_blank" class="link-btn doc-link"
                            title="查看使用文档">
                            <BookOpenTextIcon :size="16" />
                            <span>使用文档</span>
                        </a>
                    </div>

                    <button v-if="plugin.localState === 'not_installed' || plugin.localState === 'update'"
                        class="confirm-install-btn" @click="$emit('install', plugin)">
                        <CloudDownloadIcon v-if="plugin.localState !== 'update'" :size="16" />
                        <RefreshCwIcon v-else :size="16" />
                        {{ plugin.localState === 'update' ? '立即更新' : '立即安装' }}
                    </button>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
// 引入必要的图标
import { GithubIcon, BookOpenTextIcon, CloudDownloadIcon, RefreshCwIcon } from 'lucide-vue-next';

defineProps({
    isOpen: Boolean,
    plugin: {
        type: Object,
        default: () => ({})
    }
});
defineEmits(['close', 'install']);
</script>

<style scoped>
/* ==========================================
   1. 模态框基础布局 (保持不变)
   ========================================== */
.modal-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
}

.modal-container {
    background: #ffffff;
    width: 90%;
    max-width: 520px;
    border-radius: 24px;
    padding: 32px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    max-height: 90vh;
    display: flex;
    flex-direction: column;
}

/* Header */
.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    flex-shrink: 0;
}

.header-main {
    display: flex;
    gap: 16px;
    align-items: center;
}

.p-icon {
    width: 64px;
    height: 64px;
    background: #eff6ff;
    border-radius: 16px;
    display: grid;
    place-items: center;
    overflow: hidden;
    border: 1px solid #e2e8f0;
    flex-shrink: 0;
}

.p-icon img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.fallback-icon {
    font-size: 28px;
    font-weight: 800;
    color: #3b82f6;
    font-family: monospace;
}

.title-area h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 800;
    color: #1e293b;
    line-height: 1.2;
}

.v {
    font-size: 14px;
    color: #94a3b8;
    font-family: monospace;
    font-weight: 400;
    margin-left: 4px;
}

.author {
    margin: 4px 0 0 0;
    font-size: 14px;
    color: #64748b;
}

.close-btn {
    background: none;
    border: none;
    font-size: 18px;
    color: #94a3b8;
    cursor: pointer;
    padding: 0;
    margin-top: -4px;
}

.close-btn:hover {
    color: #1e293b;
}

/* Body */
.modal-body {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.stats-row {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    flex-shrink: 0;
    flex-wrap: wrap;
}

.stat-item {
    font-size: 12px;
    background: #f1f5f9;
    padding: 6px 12px;
    border-radius: 8px;
    color: #475569;
    font-weight: 600;
}

/* 描述区域 (保持滚动) */
.content-section {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    margin-bottom: 16px;
}

.content-section h3 {
    font-size: 15px;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 10px 0;
    flex-shrink: 0;
}

.desc-container {
    flex: 1;
    background: #f8fafc;
    border-radius: 12px;
    padding: 16px;
    border: 1px solid #e2e8f0;
    overflow-y: auto;
    max-height: 260px;
}

.long-desc {
    font-size: 14px;
    line-height: 1.7;
    color: #475569;
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
}

/* 美化滚动条 (Webkit) */
.desc-container::-webkit-scrollbar {
    width: 6px;
}

.desc-container::-webkit-scrollbar-track {
    background: transparent;
    margin: 8px 0;
}

.desc-container::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 3px;
}

.desc-container::-webkit-scrollbar-thumb:hover {
    background-color: #94a3b8;
}

/* Tags */
.tags-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    flex-shrink: 0;
}

.tag {
    font-size: 11px;
    color: #3b82f6;
    background: #eff6ff;
    padding: 3px 10px;
    border-radius: 12px;
    font-weight: 600;
}

/* ==========================================
   ★ 2. Footer 链接按钮 (核心修改点)
   ========================================== */
.modal-footer {
    margin-top: auto;
    padding-top: 24px;
    border-top: 1px solid #f1f5f9;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
    gap: 16px;
    /* 增加整体间距 */
}

/* 链接按钮组 */
.link-group {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

/* 图标按钮基础样式 (a 标签仿真按钮) */
.link-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    /* 图标和文字间距 */
    text-decoration: none;
    font-size: 13px;
    font-weight: 600;
    padding: 10px 16px;
    border-radius: 10px;
    transition: all 0.2s ease;
    cursor: pointer;
    border: 1px solid transparent;
}

/* 默认配色 (灰色次级按钮) */
.link-btn {
    background-color: #f1f5f9;
    color: #475569;
    border-color: #e2e8f0;
}

.link-btn:hover {
    background-color: #e2e8f0;
    color: #1e293b;
    transform: translateY(-1px);
}

/* 特定配色 (可选：让 GitHub 按钮看起来不一样) */
/* .github-link { background-color: #24292e; color: #fff; } */
/* .github-link:hover { background-color: #000; } */

/* 主安装按钮 (增加图标适配) */
.confirm-install-btn {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 12px 28px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    /* 防止按钮收缩 */
}

.confirm-install-btn:hover {
    background: #2563eb;
    transform: translateY(-1px);
}

/* 动画与加载状态 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.loading-state {
    padding: 40px;
    text-align: center;
    color: #94a3b8;
    font-size: 14px;
    font-style: italic;
}

/* 小屏幕适配 */
@media (max-width: 520px) {
    .modal-container {
        padding: 24px;
    }

    .modal-footer {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
    }

    .link-group {
        justify-content: flex-start;
    }

    .confirm-install-btn {
        justify-content: center;
        width: 100%;
    }
}

@media (max-width: 480px) {
    .p-icon {
        width: 48px;
        height: 48px;
    }

    .fallback-icon {
        font-size: 22px;
    }

    .title-area h2 {
        font-size: 18px;
    }

    .desc-container {
        max-height: 200px;
        padding: 12px;
    }

    .link-btn {
        padding: 8px 12px;
        font-size: 12px;
    }
}
</style>