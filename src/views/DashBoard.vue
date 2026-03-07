<template>
    <div class="dashboard-content">
        <div class="section-intro">
            <h1>已安装插件</h1>
            <p>管理系统核心适配器与第三方功能扩展</p>
        </div>

        <div class="plugin-grid">
            <div v-for="p in plugins" :key="p.id" class="plugin-card" :class="{ 'is-ignored': p.status === 'ignored' }">
                <div class="card-head">
                    <div class="p-icon">
                        <component :is="getIcon(p.info.name)" :size="20" />
                    </div>
                    <div class="status-badge" :class="p.status">{{ p.status }}</div>
                </div>
                <div class="card-body">
                    <div class="title-row">
                        <h3>{{ p.info.name }}</h3>
                        <span class="v-tag">v{{ formatVer(p.info.version) }}</span>
                    </div>
                    <p class="description">{{ p.info.desc || '暂无描述' }}</p>
                </div>
                <div class="card-footer">
                    <button class="config-action-btn" @click="handleOpenConfig(p.id)">配置项</button>
                </div>
            </div>
        </div>

        <ConfigModal :isOpen="modalVisible" :schema="currentSchema" :loading="saveLoading" @close="modalVisible = false"
            @save="onSaveConfig" />
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
    LayoutGridIcon, MonitorIcon, LogOutIcon, PackageIcon,
    SettingsIcon, CloudSunIcon, CpuIcon, ShieldCheckIcon,
    RegexIcon, MenuIcon
} from 'lucide-vue-next';
import { api } from '../api';
import { showNotice } from '../utils/notice';
import ConfigModal from '../components/ConfigModal.vue';

const router = useRouter();
const isMenuOpen = ref(false);
const viewMode = ref('grid');
const activePath = ref('');
const currentTitle = ref('');
const plugins = ref([]);
const customPages = ref([]);

// 弹窗相关
const modalVisible = ref(false);
const currentSchema = ref({});
const saveLoading = ref(false);
const editingId = ref('');

const init = async () => {
    try {
        const pRes = await api.getPlugins();
        if (pRes.code === 200) {
            // 适配对象结构转数组
            plugins.value = Object.entries(pRes.data).map(([key, val]) => ({ id: key, ...val }));
        }
        const cRes = await api.getCustomPages();
        customPages.value = Array.isArray(cRes) ? cRes : [];
    } catch (err) {
        console.error(err);
        showNotice('数据加载失败，请检查网络', 'error');
    }
};

const formatVer = (v) => Array.isArray(v) ? v.join('.') : (v || '1.0.0');

const getIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('regex')) return RegexIcon;
    if (n.includes('system')) return CpuIcon;
    if (n.includes('bridge')) return ShieldCheckIcon;
    if (n.includes('motd')) return CloudSunIcon;
    return PackageIcon;
};

// 导航逻辑：在移动端点击后自动关闭菜单
const handleNavClick = (mode, page = null) => {
    viewMode.value = mode;
    isMenuOpen.value = false;
    if (page) {
        activePath.value = page.path;
        currentTitle.value = page.title;
    }
};

const handleOpenConfig = async (id) => {
    editingId.value = id;
    try {
        const res = await api.getConfig(id);
        if (res.code === 200) {
            currentSchema.value = res.data;
            modalVisible.value = true;
        }else{
            showNotice('插件没有提供网页编辑的配置项，您可能需要手动修改配置文件', 'info');
        }
    } catch (err) {
        console.error(err);
        showNotice('插件没有提供网页编辑的配置项，您可能需要手动修改配置文件', 'info');
    }
};

const onSaveConfig = async (payload) => {
    saveLoading.value = true;
    try {
        const res = await api.saveConfig(editingId.value, payload);
        if (res.code === 200) {
            showNotice('配置保存成功！', 'success');
            modalVisible.value = false;
        }
    } catch (e) {
        showNotice('保存失败，请检查后端', 'error');
    } finally {
        saveLoading.value = false;
    }
};

const handleLogout = () => {
    localStorage.removeItem('sb3_token');
    showNotice('已安全退出登录', 'info');
    router.push('/login');
};

onMounted(init);
</script>
<style scoped>
/* --- 1. 页面容器与头部 --- */
.dashboard-content {
    animation: fadeIn 0.4s ease-out;
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

.section-intro {
    margin-bottom: 32px;
}

.section-intro h1 {
    font-size: 24px;
    font-weight: 800;
    color: #1e293b;
    margin: 0 0 8px 0;
}

.section-intro p {
    color: #64748b;
    font-size: 14px;
}

/* --- 2. 插件响应式网格 --- */
.plugin-grid {
    display: grid;
    /* 核心：自动填充列，每列最小 300px，最大平分空间 */
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
}

/* --- 3. 插件卡片样式 --- */
.plugin-card {
    background: #ffffff;
    border-radius: 20px;
    padding: 24px;
    border: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
}

.plugin-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 30px rgba(59, 130, 246, 0.08);
    border-color: #3b82f6;
}

/* 忽略状态卡片变灰 */
.plugin-card.is-ignored {
    opacity: 0.6;
    filter: grayscale(1);
    border-style: dashed;
}

/* --- 4. 卡片头部 (图标与状态) --- */
.card-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
}

.p-icon {
    width: 48px;
    height: 48px;
    background: #eff6ff;
    color: #3b82f6;
    border-radius: 14px;
    display: grid;
    place-items: center;
}

.status-badge {
    font-size: 10px;
    font-weight: 800;
    padding: 4px 10px;
    border-radius: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.status-badge.loaded {
    background: #dcfce7;
    color: #16a34a;
}

.status-badge.ignored {
    background: #f1f5f9;
    color: #64748b;
}
.status-badge.disabled {
    background: #f1f5f9;
    color: #e91d1d;
}
/* --- 5. 卡片主体 --- */
.card-body {
    flex: 1;
}

.title-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 6px;
}

.title-row h3 {
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
}

.v-tag {
    font-size: 11px;
    font-family: 'Fira Code', monospace;
    background: #f1f5f9;
    color: #64748b;
    padding: 2px 6px;
    border-radius: 6px;
}

.author {
    font-size: 12px;
    color: #94a3b8;
    margin: 0 0 12px 0;
}

.description {
    font-size: 13px;
    color: #64748b;
    line-height: 1.6;
    /* 限制两行高度，超出省略号 */
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    height: 42px;
}

/* --- 6. 卡片底部与配置按钮 --- */
.card-footer {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #f8fafc;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.priority-tag {
    font-size: 11px;
    font-weight: 600;
    color: #94a3b8;
}

/* 按钮样式补丁：彻底去除原生边框 */
.config-action-btn {
    background: #3b82f6;
    color: #ffffff;
    border: none !important;
    outline: none !important;
    padding: 10px 18px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: 0.2s;
}

.config-action-btn:hover {
    background: #2563eb;
    transform: scale(1.02);
}

.config-action-btn:active {
    transform: scale(0.98);
}

/* --- 7. 全面屏 Iframe 容器 --- */
.iframe-view {
    width: 100%;
    height: calc(100vh - 160px);
    /* 减去顶部栏和边距 */
    background: #ffffff;
    border-radius: 24px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
}

.iframe-view iframe {
    width: 100%;
    height: 100%;
}

/* --- 8. 移动端响应式补丁 --- */
@media (max-width: 640px) {
    .section-intro h1 {
        font-size: 20px;
    }

    .plugin-grid {
        grid-template-columns: 1fr;
        /* 手机端单列显示 */
    }

    .plugin-card {
        padding: 20px;
    }
}
</style>