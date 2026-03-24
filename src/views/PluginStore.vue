<template>
    <div class="dashboard-content">
        <div class="page-header">
            <div class="section-intro">
                <h1>插件市场</h1>
                <p>探索并安装由社区与官方提供的 SparkBridge3 扩展功能</p>
            </div>

            <!-- <div class="node-selector-container">
                <div class="node-selector-wrapper">
                    <div class="node-label">
                        <GlobeIcon :size="16" class="node-icon" />
                        <span>下载加速节点</span>
                    </div>
                    <UiSelect v-model="selectedProxy" :options="proxyOptions" width="240px" />
                </div>
                <p class="node-hint">提示：仅对 GitHub 来源生效，直链将自动忽略并直连</p>
            </div> -->
        </div>

        <div class="filter-bar">
            <div class="filter-item search-box">
                <SearchIcon :size="16" class="f-icon" />
                <input type="text" v-model="searchQuery" placeholder="搜索插件名称或描述..." />
            </div>

            <UiSelect v-model="selectedAuthor" :options="authorOptions" width="200px" class="filter-select" />
            <UiSelect v-model="selectedTag" :options="tagOptions" width="200px" class="filter-select" />
        </div>

        <div class="plugin-grid" v-if="filteredPlugins.length > 0">
            <div v-for="plugin in filteredPlugins" :key="plugin.name" class="plugin-card"
                @click="handleOpenDetail(plugin)">

                <div class="card-head">
                    <div class="p-icon">
                        <img v-if="plugin.icon" :src="plugin.icon" :alt="plugin.name" class="plugin-img" @error="iconError" />
                        <span v-else class="fallback-icon">{{ plugin.name.charAt(0).toUpperCase() }}</span>
                    </div>

                    <div :class="['status-badge', plugin.localState]">
                        <CheckIcon v-if="plugin.localState === 'installed'" :size="12" style="margin-right: 2px;" />
                        {{ getStatusLabel(plugin.localState) }}
                    </div>
                </div>

                <div class="card-body">
                    <div class="title-row">
                        <h3>{{ plugin.name }}</h3>
                        <span class="v-tag" v-if="plugin.localState === 'update'">
                            v{{ plugin.localVersion }}
                            <ArrowRightIcon :size="10" /> v{{ plugin.version }}
                        </span>
                        <span class="v-tag" v-else>v{{ plugin.version }}</span>
                    </div>

                    <p class="author" @click.stop="selectedAuthor = plugin.author">
                        <UserIcon :size="12" class="author-icon" />
                        {{ plugin.author }}
                    </p>

                    <p class="description">{{ plugin.desc }}</p>

                    <div class="tags-group">
                        <span v-for="tag in plugin.tags" :key="tag" class="small-tag" @click.stop="selectedTag = tag">
                            {{ tag }}
                        </span>
                    </div>
                </div>

                <div class="card-footer">
                    <a v-if="plugin.repo" :href="plugin.repo" target="_blank" class="icon-btn" @click.stop>
                        <GithubIcon :size="18" />
                    </a>
                    <div v-else class="icon-placeholder"></div>

                    <div class="action-group">
                        <button v-if="plugin.localState === 'core'" class="btn-disabled" disabled>系统内置</button>
                        <button v-else-if="plugin.localState === 'installed'" class="action-btn btn-danger"
                            @click.stop="handleUninstall(plugin)">
                            <Trash2Icon :size="14" /> 卸载
                        </button>
                        <button v-else class="action-btn btn-primary"
                            :class="{ 'is-loading': installStates[plugin.name]?.isLoading }"
                            :disabled="installStates[plugin.name]?.isLoading" @click.stop="handleInstall(plugin)">
                            <Loader2Icon v-if="installStates[plugin.name]?.isLoading" :size="14" class="spin-icon" />
                            <CloudDownloadIcon v-else :size="14" />
                            {{ installStates[plugin.name]?.text || (plugin.localState === 'update' ? '更新' : '安装') }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="empty-state" v-else>
            <div class="empty-icon">
                <SearchXIcon :size="48" />
            </div>
            <h3>未找到相关插件</h3>
            <button class="reset-filter-btn" @click="resetFilters">重置筛选</button>
        </div>

        <PluginDetailModal :is-open="detailVisible" :plugin="currentDetail" @close="detailVisible = false"
            @install="handleInstallFromDetail" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
    CloudDownloadIcon, RefreshCwIcon, Trash2Icon, GithubIcon, UserIcon,
    ArrowRightIcon, GlobeIcon, CheckIcon, Loader2Icon, SearchIcon, SearchXIcon
} from 'lucide-vue-next';
import { showNotice } from '../utils/notice';
import UiSelect from '../components/UiSelect.vue';
import PluginDetailModal from '../components/PluginDetailModal.vue';

// --- 数据状态 ---
const installedPlugins = ref({});
const remotePlugins = ref([]);
const installStates = ref({});
const detailVisible = ref(false);
const currentDetail = ref(null);
let pollTimer = null;

const searchQuery = ref('');
const selectedTag = ref('all');
const selectedAuthor = ref('all');
const selectedProxy = ref('https://gh-proxy.com/');
const proxyOptions = [
    { label: '🚀 直连', value: '' },
    { label: '官方加速 (gh-proxy.com)', value: 'https://gh-proxy.com/' }
];

// --- 逻辑处理 ---
const getToken = () => localStorage.getItem('sb3_token') || localStorage.getItem('user-token') || '';
const formatVer = (v) => Array.isArray(v) ? v.join('.') : (v || '0.0.0');
const getStatusLabel = (s) => ({ core: '核心保护', update: '可更新', installed: '已安装', not_installed: '未安装' }[s]);

const fetchAllData = async () => {
    try {
        const [localRes, remoteRes] = await Promise.all([
            fetch('/api/plugins/list', { headers: { 'Authorization': `Bearer ${getToken()}` } }).then(r => r.json()),
            fetch('https://lition.top/api/v1/plugins').then(r => r.json())
        ]);
        if (localRes.code === 200) installedPlugins.value = localRes.data;
        if (remoteRes.code === 200) {
            remotePlugins.value = remoteRes.data;
            remoteRes.data.forEach(p => {
                if (!installStates.value[p.name]) {
                    installStates.value[p.name] = { isLoading: false, text: '' };
                }
            });
        }
    } catch (e) { showNotice('同步插件数据失败', 'error'); }
};

onMounted(fetchAllData);

// --- 筛选与状态计算 ---
const storePlugins = computed(() => {
    return remotePlugins.value.map(remote => {
        const local = installedPlugins.value[remote.name];
        let localState = 'not_installed', localVersion = '0.0.0';
        if (local) {
            localVersion = formatVer(local.info.version);
            if (local.virtual) localState = 'core';
            else if (remote.version !== localVersion) localState = 'update';
            else localState = 'installed';
        }
        return { ...remote, localState, localVersion };
    });
});

const filteredPlugins = computed(() => storePlugins.value.filter(p => {
    const q = searchQuery.value.toLowerCase();
    const mSearch = !q || p.name.toLowerCase().includes(q) || (p.desc && p.desc.toLowerCase().includes(q));
    const mTag = selectedTag.value === 'all' || p.tags?.includes(selectedTag.value);
    const mAuth = selectedAuthor.value === 'all' || p.author === selectedAuthor.value;
    return mSearch && mTag && mAuth;
}));

// --- 弹窗逻辑 ---
const handleOpenDetail = async (plugin) => {
    currentDetail.value = { ...plugin, loading: true };
    detailVisible.value = true;
    try {
        const res = await fetch(`https://lition.top/api/v1/plugins/${plugin.name}`).then(r => r.json());
        if (res.code === 200) currentDetail.value = { ...currentDetail.value, ...res.data, loading: false };
    } catch (e) { currentDetail.value.loading = false; }
};

const handleInstallFromDetail = (plugin) => {
    detailVisible.value = false;
    handleInstall(plugin);
};

// --- 安装核心逻辑 ---
const handleInstall = async (plugin) => {
    const state = installStates.value[plugin.name];
    state.isLoading = true;
    state.text = '解析中...';
    try {
        const dRes = await fetch(`https://lition.top/api/v1/plugins/${plugin.name}`).then(r => r.json());
        let downloadUrl = dRes.data.downloadUrl;
        if (selectedProxy.value && downloadUrl.includes('github.com')) {
            downloadUrl = selectedProxy.value + downloadUrl;
        }
        downloadUrl = `https://lition.top/api/v1/plugins/${plugin.name}/download`;
        // console.log(downloadUrl);
        const res = await fetch('/api/plugins/task/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
            body: JSON.stringify({ url: downloadUrl })
        }).then(r => r.json());

        if (res.code === 200) startPolling(plugin.name, res.data.taskId);
    } catch (e) {
        state.isLoading = false;
        showNotice('安装请求失败', 'error');
    }
};

const startPolling = (pluginName, taskId) => {
    // 1. 如果已有定时器，先清理，防止叠加
    if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
    }

    const state = installStates.value[pluginName];

    pollTimer = setInterval(async () => {
        try {
            const res = await fetch(`/api/plugins/task/status/${taskId}`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });

            // 如果请求本身失败（如 401 或 500）
            if (!res.ok) {
                throw new Error(`服务器响应异常: ${res.status}`);
            }

            const resData = await res.json();

            // 2. 只有 code 为 200 才处理逻辑
            if (resData.code === 200 && resData.data) {
                const data = resData.data;
                const progress = data.progress || 0;

                // 更新 UI 文字
                const actionName = data.status === 'extracting' ? '解压中' : (data.status === 'installing' ? '安装中' : '下载中');
                state.text = `${actionName} ${progress}%`;

                // 3. 核心修复：一旦进入终态（成功或失败），立即清除定时器
                if (data.status === 'success' || data.status === 'error' || data.status === 'failed') {
                    stopAndCleanup(pluginName);

                    if (data.status === 'success') {
                        state.text = '安装成功';
                        showNotice(`插件 ${pluginName} 安装成功！`, 'success');
                        await fetchAllData(); // 刷新本地列表
                    } else {
                        state.text = '安装失败';
                        showNotice('插件安装失败：'+ data.errorDetail, 'error');
                    }
                }
            } else {
                // 如果后端返回 code 报错（如任务 ID 不存在）
                throw new Error(resData.msg || '获取任务状态失败');
            }
        } catch (error) {
            // 4. 重点：请求报错或解析报错时，也必须停止轮询，否则会无限报错
            console.error('轮询任务状态出错:', error);
            stopAndCleanup(pluginName);
            state.text = '获取失败';
            showNotice(`状态追踪已中断: ${error.message}`, 'error');
        }
    }, 1000);
};

function iconError(e){
    e.srcElement.src = 'https://s41.ax1x.com/2026/03/24/peKWzGR.webp';
    e.srcElement.onerror = null;
}

// 辅助清理函数
const stopAndCleanup = (name) => {
    if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
    }
    if (installStates.value[name]) {
        installStates.value[name].isLoading = false;
    }
};

// --- 选项生成 ---
const authorOptions = computed(() => [{ label: '👥 所有作者', value: 'all' }, ...Array.from(new Set(remotePlugins.value.map(p => p.author))).map(a => ({ label: `👤 ${a}`, value: a }))]);
const tagOptions = computed(() => [{ label: '🏷️ 所有标签', value: 'all' }, ...Array.from(new Set(remotePlugins.value.flatMap(p => p.tags || []))).map(t => ({ label: `🏷️ ${t}`, value: t }))]);
const resetFilters = () => { searchQuery.value = ''; selectedTag.value = 'all'; selectedAuthor.value = 'all'; };
const handleUninstall = () => showNotice('请在“已安装”页面管理', 'info');
</script>

<style scoped>
/* ==========================================
   1. 基础布局与动画
   ========================================== */
.dashboard-content {
    animation: fadeIn 0.4s ease-out;
    max-width: 1200px;
    margin: 0 auto;
    padding-bottom: 40px;
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

/* ==========================================
   2. Header 头部区域
   ========================================== */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 20px;
}

.section-intro h1 {
    font-size: 26px;
    font-weight: 800;
    color: #1e293b;
    margin: 0 0 8px 0;
}

.section-intro p {
    color: #64748b;
    font-size: 14px;
    margin: 0;
}

.node-selector-container {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
}

.node-selector-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
}

.node-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: #475569;
}

.node-icon {
    color: #3b82f6;
}

.node-hint {
    font-size: 12px;
    color: #94a3b8;
    margin: 0;
    padding-right: 4px;
}

/* ==========================================
   3. 筛选栏 Filter Bar
   ========================================== */
.filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 24px;
    background: #ffffff;
    padding: 16px;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
}

.filter-item {
    position: relative;
    display: flex;
    align-items: center;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    transition: all 0.2s ease;
}

.filter-item:focus-within {
    border-color: #3b82f6;
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.f-icon {
    position: absolute;
    left: 14px;
    color: #94a3b8;
    pointer-events: none;
}

.search-box {
    flex: 1;
    min-width: 240px;
}

.search-box input {
    width: 100%;
    border: none;
    background: transparent;
    padding: 12px 16px 12px 40px;
    font-size: 14px;
    color: #1e293b;
    outline: none;
}

/* ==========================================
   4. 插件网格与卡片
   ========================================== */
.plugin-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
}

.plugin-card {
    background: #ffffff;
    border-radius: 20px;
    padding: 24px;
    border: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    position: relative;
}

.plugin-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 30px rgba(59, 130, 246, 0.08);
    border-color: #3b82f6;
}

/* 头部图标与状态 */
.card-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
}

.p-icon {
    width: 48px;
    height: 48px;
    background: #eff6ff;
    color: #3b82f6;
    border-radius: 14px;
    display: grid;
    place-items: center;
    overflow: hidden;
    border: 1px solid #dbeafe;
}

.plugin-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.fallback-icon {
    font-size: 22px;
    font-weight: 800;
    color: #3b82f6;
}

/* 状态标签配色 */
.status-badge {
    font-size: 11px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 8px;
}

.status-badge.core {
    background: #fee2e2;
    color: #dc2626;
    border: 1px solid #fecaca;
}

.status-badge.update {
    background: #fef3c7;
    color: #d97706;
    border: 1px solid #fde68a;
}

.status-badge.installed {
    background: #dcfce7;
    color: #16a34a;
    border: 1px solid #bbf7d0;
}

.status-badge.not_installed {
    background: #f1f5f9;
    color: #64748b;
    border: 1px solid #e2e8f0;
}

/* 卡片内容 */
.title-row {
    display: flex;
    align-items: center;
    gap: 8px;
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
    color: #475569;
    padding: 2px 6px;
    border-radius: 6px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.author {
    font-size: 12px;
    color: #94a3b8;
    margin: 0 0 12px 0;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-weight: 500;
    transition: color 0.2s;
}

.author:hover {
    color: #3b82f6;
}

.description {
    font-size: 13px;
    color: #64748b;
    line-height: 1.6;
    margin-bottom: 16px;
    height: 42px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.tags-group {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
}

.small-tag {
    font-size: 11px;
    color: #3b82f6;
    background: #eff6ff;
    padding: 2px 8px;
    border-radius: 10px;
    font-weight: 500;
}

/* ==========================================
   5. Card Footer 卡片页脚
   ========================================== */
.card-footer {
    margin-top: auto;
    padding-top: 16px;
    border-top: 1px solid #f8fafc;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.icon-btn {
    color: #94a3b8;
    padding: 8px;
    border-radius: 8px;
    transition: 0.2s;
    display: grid;
    place-items: center;
}

.icon-btn:hover {
    color: #0f172a;
    background: #f1f5f9;
}

.action-btn {
    border: none;
    outline: none;
    padding: 9px 18px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
}

.btn-primary {
    background: #3b82f6;
    color: #fff;
}

.btn-primary:hover:not(:disabled) {
    background: #2563eb;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.btn-primary:disabled {
    background: #93c5fd;
    cursor: not-allowed;
}

.btn-danger {
    background: #fef2f2;
    color: #ef4444;
}

.btn-danger:hover {
    background: #fee2e2;
}

.btn-disabled {
    background: #f1f5f9;
    color: #94a3b8;
    cursor: not-allowed;
}

.spin-icon {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

/* ==========================================
   6. 响应式适配
   ========================================== */
@media (max-width: 768px) {
    .page-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .node-selector-container {
        align-items: flex-start;
        width: 100%;
    }

    .filter-bar {
        flex-direction: column;
    }

    .search-box {
        width: 100%;
    }

    :deep(.filter-select) {
        width: 100% !important;
    }
}
</style>