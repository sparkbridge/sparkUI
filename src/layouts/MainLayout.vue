<template>
    <div class="app-layout">
        <transition name="fade">
            <div v-if="isMenuOpen" class="mobile-overlay" @click="isMenuOpen = false"></div>
        </transition>

        <aside class="sb-sidebar" :class="{ 'mobile-open': isMenuOpen }">
            <div class="sidebar-header">
                <div class="logo-box">S</div>
                <div class="brand-text">SparkBridge<span>3</span></div>
            </div>

            <nav class="nav-menu">
                <div class="nav-group">
                    <div class="menu-label">主要模块</div>
                    <button class="menu-item" :class="{ active: $route.path === '/overview' }"
                        @click="navTo('/overview')">
                        <ZapIcon :size="18" />
                        <span>系统状态</span>
                    </button>
                    <button class="menu-item" :class="{ active: $route.path === '/dashboard' }"
                        @click="navTo('/dashboard')">
                        <LayoutGridIcon :size="18" />
                        <span>插件中心</span>
                    </button>
                    <button class="menu-item" :class="{ active: $route.path === '/regexengine' }"
                        @click="navTo('/regexengine')">
                        <WorkflowIcon :size="18" />
                        <span>规则引擎</span>
                    </button>
                </div>

                <div class="nav-group" v-if="customPages.length > 0">
                    <div class="menu-label">插件页面</div>
                    <button v-for="page in customPages" :key="page.id" class="menu-item"
                        :class="{ active: $route.path === `/custom/${page.id}` }" @click="navTo(`/custom/${page.id}`)">
                        <MonitorIcon :size="18" />
                        <span>{{ page.title }}</span>
                    </button>
                </div>
            </nav>

            <div class="sidebar-footer">
                <button class="logout-btn" @click="handleLogout">
                    <LogOutIcon :size="18" />
                    <span>退出登录</span>
                </button>
                <div class="sidebar-info">
                    <p>© 2022 - 2026 SparkBridge3</p>
                    <div class="build-tag">
                        <span class="dot"></span>
                        Web Build {{ appVersion }} ({{ buildTime }})
                    </div>
                </div>
            </div>
        </aside>

        <main class="main-stage">
            <header class="top-bar">
                <div class="header-left">
                    <button class="menu-toggle" @click="isMenuOpen = true">
                        <MenuIcon :size="24" />
                    </button>
                    <div class="breadcrumb">
                        控制台 / <span>{{ currentRouteName }}</span>
                    </div>
                </div>

                <div class="header-right">
                    <div class="status-info desktop-only">
                        <span class="pulse-dot"></span>
                        API已连接
                    </div>
                    <div class="mobile-only">
                        <span class="pulse-dot"></span>
                    </div>
                </div>
            </header>

            <div class="page-content">
                <router-view v-slot="{ Component }">
                    <transition name="page-slide" mode="out-in">
                        <component :is="Component" />
                    </transition>
                </router-view>
            </div>
        </main>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'; // 新增引入 onUnmounted
import { useRouter, useRoute } from 'vue-router';
import {
    LayoutGridIcon, MonitorIcon, LogOutIcon,
    MenuIcon, ShieldCheckIcon, LayoutDashboardIcon, ZapIcon, WorkflowIcon
} from 'lucide-vue-next';
import { api } from '../api';
import { showNotice } from '../utils/notice';

const appVersion = __APP_VERSION__;
const buildTime = __BUILD_TIME__;

const router = useRouter();
const route = useRoute();
const isMenuOpen = ref(false);
const customPages = ref([]);

// 动态获取当前页面名称用于面包屑
const currentRouteName = computed(() => {
    if (route.path === '/dashboard') return '插件管理';
    if (route.path === '/overview') return '系统状态';
    if (route.path === '/regexengine') return '规则引擎';

    // 如果是动态插件页面 (判断路径是否以 /custom/ 开头)
    if (route.path.startsWith('/custom/')) {
        // 提取出 URL 最后的 id (例如 sb3_regex_1772713017502)
        const currentId = route.path.replace('/custom/', '');
        // 根据 id 查找对应的插件标题
        const activeCustomPage = customPages.value.find(p => p.id === currentId);
        if (activeCustomPage) return activeCustomPage.title;
    }

    return '应用详情';
});

// 获取全面屏插件列表（用于侧边栏展示）
const fetchSidebarData = async () => {
    try {
        const res = await api.getCustomPages();
        customPages.value = Array.isArray(res.data) ? res.data : [];
        console.log(res.data[0]);
    } catch (err) {
        console.error('Sidebar data error');
    }
};

const navTo = (path) => {
    console.log('Navigating to', path);
    router.push(path);
    isMenuOpen.value = false; // 移动端跳转后自动关掉抽屉
};

const handleLogout = () => {
    localStorage.removeItem('sb3_token');
    showNotice('已安全退出登录', 'success');
    router.push('/login');
};

// ==========================================
// 新增：处理 iframe 插件传来的 Token 获取请求
// ==========================================
const handleIframeMessage = (event) => {
    if (event.data && event.data.action === 'GET_SB3_TOKEN') {
        // 注意：这里读取的 key 是 'sb3_token'，与你退出登录时的 key 保持一致
        const token = localStorage.getItem('sb3_token') || '';

        if (event.source) {
            const targetOrigin = event.origin !== 'null' ? event.origin : '*';
            event.source.postMessage({
                action: 'SB3_TOKEN',
                payload: { token: token }
            }, targetOrigin);
        }
    }
};

onMounted(() => {
    fetchSidebarData();
    // 挂载时添加 message 监听
    window.addEventListener('message', handleIframeMessage);
});

// 新增：组件卸载时移除监听，防止内存泄漏
onUnmounted(() => {
    window.removeEventListener('message', handleIframeMessage);
});
</script>

<style scoped>
/* --- 布局核心样式 --- */
.app-layout {
    display: flex;
    width: 100vw;
    height: 100vh;
    background-color: #f8fafc;
    overflow: hidden;
}

/* --- 侧边栏样式 --- */
.sb-sidebar {
    width: 260px;
    background: white;
    border-right: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    z-index: 2000;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-header {
    padding: 32px 24px;
    display: flex;
    align-items: center;
    gap: 12px;
}

/* --- 侧边栏 Footer 样式 --- */
.sidebar-info {
    margin-top: 16px;
    padding: 0 16px;
    border-top: 1px solid #f1f5f9;
    padding-top: 16px;
}

.sidebar-info p {
    font-size: 11px;
    color: #94a3b8;
    margin: 0;
    font-weight: 500;
    letter-spacing: 0.5px;
}

.build-tag {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
    font-size: 10px;
    color: #cbd5e1;
    text-transform: uppercase;
    font-family: 'Fira Code', monospace;
}

.build-tag .dot {
    width: 4px;
    height: 4px;
    background: #cbd5e1;
    border-radius: 50%;
}

@media (max-height: 600px) {
    .sidebar-info {
        display: none;
    }
}

.logo-box {
    width: 32px;
    height: 32px;
    background: #3b82f6;
    color: white;
    border-radius: 8px;
    display: grid;
    place-items: center;
    font-weight: 800;
    font-size: 18px;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.brand-text {
    font-size: 18px;
    font-weight: 700;
    color: #1e293b;
}

.brand-text span {
    color: #3b82f6;
}

.nav-menu {
    flex: 1;
    padding: 0 16px;
    overflow-y: auto;
}

/* 新增：菜单分组，增加底部间距 */
.nav-group {
    margin-bottom: 24px;
}

.menu-label {
    font-size: 11px;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    /* 调整了 margin，让分组内的头部更紧凑 */
    margin: 0 12px 10px;
    letter-spacing: 1px;
}

button {
    border: none !important;
    outline: none !important;
    background: transparent;
    cursor: pointer;
    font-family: inherit;
    padding: 0;
}

.menu-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 12px;
    color: #64748b;
    font-size: 14px;
    font-weight: 500;
    transition: 0.2s;
    margin-bottom: 4px;
}

.menu-item:hover {
    background: #f8fafc;
    color: #3b82f6;
}

.menu-item.active {
    background: #eff6ff;
    color: #3b82f6;
    font-weight: 600;
}

.sidebar-footer {
    padding: 20px 16px;
    border-top: 1px solid #f1f5f9;
}

.logout-btn {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 12px;
    color: #94a3b8;
    font-size: 14px;
    transition: 0.2s;
}

.logout-btn:hover {
    background: #fef2f2;
    color: #ef4444;
}

/* --- 主体部分 --- */
.main-stage {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.top-bar {
    height: 64px;
    background: white;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32px;
    flex-shrink: 0;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 16px;
}

.menu-toggle {
    display: none;
    color: #64748b;
}

.breadcrumb {
    font-size: 14px;
    color: #94a3b8;
}

.breadcrumb span {
    color: #1e293b;
    font-weight: 600;
}

.status-info {
    font-size: 12px;
    color: #10b981;
    background: #ecfdf5;
    border: 1px solid #d1fae5;
    padding: 6px 14px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.pulse-dot {
    width: 6px;
    height: 6px;
    background: #10b981;
    border-radius: 50%;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% {
        opacity: 1;
    }

    50% {
        opacity: 0.3;
    }

    100% {
        opacity: 1;
    }
}

.page-content {
    flex: 1;
    overflow-y: auto;
    padding: 32px;
}

@media (max-width: 768px) {
    .menu-toggle {
        display: block;
    }

    .desktop-only {
        display: none;
    }

    .sb-sidebar {
        position: fixed;
        left: -260px;
        top: 0;
        bottom: 0;
        box-shadow: 20px 0 50px rgba(0, 0, 0, 0.1);
    }

    .sb-sidebar.mobile-open {
        transform: translateX(260px);
    }

    .mobile-overlay {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.4);
        backdrop-filter: blur(4px);
        z-index: 1500;
    }

    .top-bar {
        padding: 0 20px;
    }

    .page-content {
        padding: 20px;
    }
}

.page-slide-enter-active,
.page-slide-leave-active {
    transition: all 0.3s ease;
}

.page-slide-enter-from {
    opacity: 0;
    transform: translateY(10px);
}

.page-slide-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>