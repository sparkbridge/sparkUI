<template>
    <div class="iframe-wrapper">
        <div v-if="loading" class="iframe-loading">
            <LoaderIcon class="spin" :size="24" />
            <span>正在装载插件环境...</span>
        </div>

        <iframe v-show="!loading && pageUrl" ref="pluginIframe" :src="pageUrl" class="plugin-iframe" frameborder="0"
            @load="onIframeLoad"></iframe>

        <div v-if="!loading && !pageUrl" class="iframe-error">
            <AppWindowIcon :size="48" class="error-icon" />
            <h3>插件视图不存在</h3>
            <p>无法找到该插件的路由地址，可能已被卸载或禁用。</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { LoaderIcon, AppWindowIcon } from 'lucide-vue-next';
import { api } from '../api';
import { showNotice } from '../utils/notice'; // 引入你的全局提示工具

const route = useRoute();
const loading = ref(true);
const pageUrl = ref('');
const pluginIframe = ref(null);

// ==========================================
// 1. 动态加载插件页面逻辑
// ==========================================
const loadPage = async () => {
    loading.value = true;
    pageUrl.value = '';

    try {
        const res = await api.getCustomPages();
        if (res.code === 200) {
            const targetPage = res.data.find(p => p.id === route.params.id);
            if (targetPage) {
                pageUrl.value = targetPage.url;
            } else {
                loading.value = false;
            }
        }
    } catch (err) {
        console.error('获取自定义页面失败', err);
        loading.value = false;
    }
};

const onIframeLoad = () => {
    loading.value = false;
};

// 监听路由参数变化，实现插件间的无缝切换
watch(() => route.params.id, (newId) => {
    if (newId) loadPage();
});

// ==========================================
// 2. 跨层级通信监听中心 (核心集成)
// ==========================================
const handleIframeMessage = (event) => {
    // 安全起见：你可以通过 event.origin 校验来源，但同域下通常不需要
    // 提取 iframe 传过来的数据体
    const { action, payload } = event.data || {};

    // 路由分发不同的 Action
    switch (action) {
        case 'SHOW_NOTICE':
            // 触发主系统的全局提示框
            if (payload && payload.msg) {
                showNotice(payload.msg, payload.type || 'info');
            }
            break;

        case 'TOKEN_EXPIRED':
            // 未来可扩展：如果插件发现 Token 失效，通知主系统踢人下线
            showNotice('插件授权失效，请重新登录', 'error');
            // router.push('/login'); 
            break;

        // 你可以在这里继续添加更多的 Case，比如 'RESIZE_IFRAME' 等
    }
};

// ==========================================
// 3. 生命周期管理
// ==========================================
onMounted(() => {
    loadPage();
    // 挂载消息监听器
    window.addEventListener('message', handleIframeMessage);
});

onUnmounted(() => {
    // 【极度重要】组件销毁时，必须移除监听器，防止内存泄漏和重复触发
    window.removeEventListener('message', handleIframeMessage);
});

</script>

<style scoped>
/* 样式部分保持之前的优雅设计 */
.iframe-wrapper {
    width: 100%;
    height: calc(100vh - 120px);
    /* 根据你的实际头部高度微调 */
    background: #ffffff;
    border-radius: 20px;
    border: 1px solid #eef2f6;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
}

.plugin-iframe {
    width: 100%;
    flex: 1;
    border: none;
    background: transparent;
}

.iframe-loading,
.iframe-error {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    background: #f8fafc;
    color: #64748b;
    font-size: 14px;
    font-weight: 600;
    z-index: 10;
}

.spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    100% {
        transform: rotate(360deg);
    }
}

.error-icon {
    color: #cbd5e1;
    margin-bottom: 8px;
}

.iframe-error h3 {
    color: #1e293b;
    margin: 0;
    font-size: 18px;
}

.iframe-error p {
    color: #94a3b8;
    margin: 0;
    font-weight: normal;
}
</style>