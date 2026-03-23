<template>
    <Transition name="fade">
        <div v-if="isOpen" class="modal-mask" @click="$emit('close')">
            <div class="modal-container" @click.stop>
                <div class="modal-header">
                    <div class="header-main">
                        <div class="p-icon">
                            <img v-if="plugin.icon" :src="plugin.icon" />
                            <span v-else>{{ plugin.name.charAt(0).toUpperCase() }}</span>
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
                            <p class="long-desc">{{ plugin.longDesc || plugin.desc }}</p>
                        </div>

                        <div class="tags-row">
                            <span v-for="tag in plugin.tags" :key="tag" class="tag">#{{ tag }}</span>
                        </div>
                    </template>
                </div>

                <div class="modal-footer">
                    <div class="link-group">
                        <a v-if="plugin.repo" :href="plugin.repo" target="_blank" class="footer-link">GitHub</a>
                        <a v-if="plugin.docUrl" :href="plugin.docUrl" target="_blank" class="footer-link">使用文档</a>
                    </div>
                    <button v-if="plugin.localState === 'not_installed' || plugin.localState === 'update'"
                        class="confirm-install-btn" @click="$emit('install', plugin)">
                        {{ plugin.localState === 'update' ? '立即更新' : '立即安装' }}
                    </button>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script setup>
defineProps(['isOpen', 'plugin']);
defineEmits(['close', 'install']);
</script>

<style scoped>
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
    max-width: 500px;
    border-radius: 24px;
    padding: 32px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
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
}

.p-icon img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.title-area h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 800;
    color: #1e293b;
}

.v {
    font-size: 14px;
    color: #94a3b8;
    font-family: monospace;
}

.author {
    margin: 4px 0 0 0;
    font-size: 14px;
    color: #64748b;
}

.stats-row {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
}

.stat-item {
    font-size: 12px;
    background: #f8fafc;
    padding: 6px 12px;
    border-radius: 8px;
    color: #64748b;
    font-weight: 600;
}

.content-section h3 {
    font-size: 15px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 8px;
}

.long-desc {
    font-size: 14px;
    line-height: 1.6;
    color: #475569;
    white-space: pre-wrap;
}

.tags-row {
    display: flex;
    gap: 8px;
    margin-top: 16px;
    flex-wrap: wrap;
}

.tag {
    font-size: 12px;
    color: #3b82f6;
    font-weight: 600;
}

.modal-footer {
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #f1f5f9;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.footer-link {
    font-size: 14px;
    color: #64748b;
    text-decoration: none;
    margin-right: 16px;
}

.footer-link:hover {
    color: #3b82f6;
}

.confirm-install-btn {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: 0.2s;
}

.confirm-install-btn:hover {
    background: #2563eb;
    transform: translateY(-2px);
}

.close-btn {
    background: none;
    border: none;
    font-size: 18px;
    color: #94a3b8;
    cursor: pointer;
}

/* 动画 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>