<template>
    <div class="dashboard-content">
        <div class="section-intro">
            <h1>已安装插件</h1>
            <p>管理系统核心适配器与第三方功能扩展</p>
        </div>

        <div class="plugin-grid">
            <div v-for="p in plugins" :key="p.id" class="plugin-card" :class="{ 'is-ignored': p.status !== 'loaded' }">
                <div class="card-head">
                    <div class="p-icon">
                        <component :is="getIcon(p.info.name)" :size="20" />
                    </div>

                    <div v-if="p.virtual" class="status-badge loaded">核心保护</div>

                    <div v-else-if="p.status === 'ignored'" class="status-badge ignored" title="该插件不适合当前运行平台或环境">已跳过
                    </div>

                    <div v-else class="switch-wrapper">
                        <span class="switch-label">{{ p.status === 'loaded' ? '已启用' : '已禁用' }}</span>
                        <input type="checkbox" class="toggle-switch" :checked="p.status === 'loaded'"
                            :disabled="p.isToggling" @change="handleToggle(p, $event.target.checked)" />
                    </div>
                </div>

                <div class="card-body">
                    <div class="title-row">
                        <h3>{{ p.info.name }}</h3>
                        <span class="v-tag">v{{ formatVer(p.info.version) }}</span>
                    </div>

                    <p class="author">
                        <UserIcon :size="12" class="author-icon" />
                        {{ p.info.author || '未知作者' }}
                    </p>

                    <p class="description">{{ p.info.desc || p.info.description || '暂无描述' }}</p>
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
    RegexIcon, MenuIcon, UserIcon
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

const modalVisible = ref(false);
const currentSchema = ref({});
const saveLoading = ref(false);
const editingId = ref('');

const init = async () => {
    try {
        const pRes = await api.getPlugins();
        if (pRes.code === 200) {
            plugins.value = Object.entries(pRes.data).map(([key, val]) => ({
                id: key,
                ...val,
                isToggling: false
            }));
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

const handleToggle = async (plugin, isEnabled) => {
    plugin.isToggling = true;
    const previousStatus = plugin.status;
    const targetStatus = isEnabled ? 'loaded' : 'disabled';

    plugin.status = targetStatus;

    try {
        const res = await fetch(`/api/plugins/toggle`, { //${plugin.id}/
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('sb3_token') || localStorage.getItem('user-token') || ''}`
            },
            body: JSON.stringify({ enable: isEnabled, id:plugin.id })
        });

        const data = await res.json();

        if (data.code === 200) {
            showNotice(`插件 ${plugin.info.name} 已${isEnabled ? '启用' : '禁用'}`, 'success');
        } else {
            throw new Error(data.msg || '切换状态失败');
        }
        console.log('切换状态:', plugin.id, isEnabled);
    } catch (err) {
        console.error('状态切换异常:', err);
        plugin.status = previousStatus;
        showNotice(err.message || '网络异常，切换失败', 'error');
    } finally {
        plugin.isToggling = false;
    }
};

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
        } else {
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
/* 核心动画与布局 */
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

.plugin-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
}

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

/* 置灰效果，被禁用和被跳过的都会被置灰 */
.plugin-card.is-ignored {
    opacity: 0.65;
    filter: grayscale(1);
    background: #f8fafc;
}

.card-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
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

/* 开关样式 */
.switch-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
}

.switch-label {
    font-size: 12px;
    color: #64748b;
    font-weight: 600;
}

.toggle-switch {
    appearance: none;
    position: relative;
    width: 44px;
    height: 24px;
    background: #e2e8f0;
    border-radius: 20px;
    cursor: pointer;
    outline: none;
    transition: background 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    margin: 0;
}

.toggle-switch:checked {
    background: #10b981;
}

.toggle-switch::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background: #ffffff;
    border-radius: 50%;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-switch:checked::after {
    transform: translateX(20px);
}

.toggle-switch:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

/* 标签 Badge 样式 (给 核心保护 / 已跳过 使用) */
.status-badge {
    font-size: 11px;
    font-weight: 800;
    padding: 4px 10px;
    border-radius: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    cursor: default;
}

.status-badge.loaded {
    background: #dcfce7;
    color: #16a34a;
}

.status-badge.ignored {
    background: #e2e8f0;
    color: #64748b;
}

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
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 500;
}

.description {
    font-size: 13px;
    color: #64748b;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    height: 42px;
    margin: 0;
}

.card-footer {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #f8fafc;
    display: flex;
    justify-content: flex-end;
    align-items: center;
}

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

@media (max-width: 640px) {
    .section-intro h1 {
        font-size: 20px;
    }

    .plugin-grid {
        grid-template-columns: 1fr;
    }

    .plugin-card {
        padding: 20px;
    }
}
</style>