<template>
    <div class="dashboard-content">
        <div class="page-header">
            <div class="section-intro">
                <h1>插件市场</h1>
                <p>探索并安装由社区与官方提供的 SparkBridge3 扩展功能</p>
            </div>

            <div class="node-selector-container">
                <div class="node-selector-wrapper">
                    <div class="node-label">
                        <GlobeIcon :size="16" class="node-icon" />
                        <span>下载加速节点</span>
                    </div>
                    <UiSelect v-model="selectedProxy" :options="proxyOptions" width="240px" />
                </div>
                <p class="node-hint">提示：仅对 GitHub 来源生效，直链将自动忽略并直连</p>
            </div>
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
            <div v-for="plugin in filteredPlugins" :key="plugin.name" class="plugin-card">

                <div class="card-head">
                    <div class="p-icon">
                        <PackageIcon :size="24" stroke-width="1.5" />
                    </div>

                    <div v-if="plugin.localState === 'core'" class="status-badge core">核心保护</div>
                    <div v-else-if="plugin.localState === 'update'" class="status-badge update">可更新</div>
                    <div v-else-if="plugin.localState === 'installed'" class="status-badge installed">
                        <CheckIcon :size="12" style="margin-right: 2px;" /> 已安装
                    </div>
                    <div v-else class="status-badge not-installed">未安装</div>
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

                    <p class="author" @click="selectedAuthor = plugin.author" title="点击筛选该作者">
                        <UserIcon :size="12" class="author-icon" />
                        {{ plugin.author }}
                    </p>

                    <p class="description">{{ plugin.desc }}</p>

                    <div class="tags-group">
                        <span v-for="tag in plugin.tags" :key="tag" class="small-tag" @click="selectedTag = tag"
                            title="点击筛选该标签">
                            {{ tag }}
                        </span>
                    </div>
                </div>

                <div class="card-footer">
                    <a :href="plugin.repo" target="_blank" class="icon-btn" title="查看源码仓库">
                        <GithubIcon :size="18" />
                    </a>

                    <div class="action-group">
                        <button v-if="plugin.localState === 'core'" class="btn-disabled" disabled>系统内置</button>
                        <button v-else-if="plugin.localState === 'installed'" class="action-btn btn-danger"
                            @click="handleUninstall(plugin)">
                            <Trash2Icon :size="14" /> 卸载
                        </button>
                        <button v-else-if="plugin.localState === 'update'" class="action-btn btn-primary"
                            @click="handleUpdate(plugin)">
                            <RefreshCwIcon :size="14" /> 更新
                        </button>
                        <button v-else class="action-btn btn-primary"
                            :class="{ 'is-loading': installStates[plugin.name]?.isLoading }"
                            :disabled="installStates[plugin.name]?.isLoading" @click="handleInstall(plugin)">
                            <Loader2Icon v-if="installStates[plugin.name]?.isLoading" :size="14" class="spin-icon" />
                            <CloudDownloadIcon v-else :size="14" />
                            {{ installStates[plugin.name]?.text || '获取 / 安装' }}
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
            <p>没有找到符合当前筛选条件的插件，请尝试更换关键词或分类。</p>
            <button class="reset-filter-btn" @click="resetFilters">重置所有筛选</button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
    PackageIcon, CloudDownloadIcon, RefreshCwIcon, Trash2Icon,
    GithubIcon, UserIcon, ArrowRightIcon, GlobeIcon, CheckIcon, Loader2Icon,
    SearchIcon, SearchXIcon
} from 'lucide-vue-next';
import { showNotice } from '../utils/notice';
import UiSelect from '../components/UiSelect.vue';

// ================= 状态数据 =================
const installedPlugins = ref({});
const remotePlugins = ref([]);
const installStates = ref({});
let pollTimer = null;

// --- 筛选栏状态 ---
const searchQuery = ref('');
const selectedTag = ref('all');
const selectedAuthor = ref('all');

// --- 代理节点状态 ---
const selectedProxy = ref('');
const proxyOptions = ref([
    { label: '🚀 直连 (不使用代理)', value: '' }
]);

// ================= Mock 数据区 =================
const remoteRegistry = [];

// ================= 助手函数 =================
const formatVer = (v) => Array.isArray(v) ? v.join('.') : (v || '0.0.0');

const compareVer = (v1, v2) => {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    const len = Math.max(parts1.length, parts2.length);
    for (let i = 0; i < len; i++) {
        const num1 = parts1[i] || 0;
        const num2 = parts2[i] || 0;
        if (num1 > num2) return 1;
        if (num1 < num2) return -1;
    }
    return 0;
};

const getToken = () => localStorage.getItem('sb3_token') || localStorage.getItem('user-token') || '';

// ================= 核心逻辑 =================

const fetchProxyList = async () => {
    try {
        const mockApiProxies = [
            { name: '官方优选节点 (gh-proxy.com)', url: 'https://gh-proxy.com/' },
            { name: '备用加速节点 (moeyy.xyz)', url: 'https://github.moeyy.xyz/' }
        ];

        const formattedProxies = mockApiProxies.map(p => ({
            label: p.name,
            value: p.url
        }));

        proxyOptions.value = [
            { label: '🚀 直连 (不使用代理)', value: '' },
            ...formattedProxies
        ];

        if (formattedProxies.length > 0) {
            selectedProxy.value = formattedProxies[0].value;
        }
    } catch (error) {
        console.error('获取代理列表失败:', error);
    }
};

const fetchLocalPlugins = async () => {
    try {
        const res = await fetch('/api/plugins/list', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const resData = await res.json();

        if (resData.code === 200) {
            installedPlugins.value = resData.data;
        } else {
            installedPlugins.value = {};
        }
    } catch (error) {
        installedPlugins.value = {};
    }
};

const fetchRemotePlugins = async () => { 
    try {
        const res = await fetch('https://sparkbridge.cn/store/index.json', {
            method: 'GET',
        });
        const resData = await res.json();
        console.log(resData);

        remotePlugins.value = resData;
    } catch (error) {
        remotePlugins.value = [];
    }
};

onMounted(async () => {
    await fetchProxyList();
    await fetchLocalPlugins();
    await fetchRemotePlugins();
    remotePlugins.value.forEach(p => {
        installStates.value[p.name] = { isLoading: false, text: '获取 / 安装' };
    });
});

// --- 将提取的数组动态转化为 UiSelect 需要的 [{label, value}] 对象格式 ---
const availableTags = computed(() => {
    const rawTags = Array.from(new Set(remotePlugins.value.flatMap(p => p.tags || []))).sort();
    return rawTags;
});

const tagOptions = computed(() => {
    const options = [{ label: '🏷️ 所有分类标签', value: 'all' }];
    availableTags.value.forEach(tag => {
        options.push({ label: `🏷️ ${tag}`, value: tag });
    });
    return options;
});

const availableAuthors = computed(() => {
    const rawAuthors = Array.from(new Set(remotePlugins.value.map(p => p.author).filter(Boolean))).sort();
    return rawAuthors;
});

const authorOptions = computed(() => {
    const options = [{ label: '👥 所有作者', value: 'all' }];
    availableAuthors.value.forEach(author => {
        options.push({ label: `👤 ${author}`, value: author });
    });
    return options;
});
// --------------------------------------------------------------------------

const storePlugins = computed(() => {
    return remotePlugins.value.map(remote => {
        const local = installedPlugins.value[remote.name];
        let localState = 'not_installed', localVersion = '0.0.0';

        if (local) {
            localVersion = formatVer(local.info.version);
            if (local.virtual) localState = 'core';
            else if (compareVer(remote.version, localVersion) > 0) localState = 'update';
            else localState = 'installed';
        }
        return { ...remote, localState, localVersion };
    });
});

const filteredPlugins = computed(() => {
    return storePlugins.value.filter(p => {
        const q = searchQuery.value.toLowerCase();
        const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.desc && p.desc.toLowerCase().includes(q));
        const matchTag = selectedTag.value === 'all' || (p.tags && p.tags.includes(selectedTag.value));
        const matchAuthor = selectedAuthor.value === 'all' || p.author === selectedAuthor.value;
        return matchSearch && matchTag && matchAuthor;
    });
});

const resetFilters = () => {
    searchQuery.value = '';
    selectedTag.value = 'all';
    selectedAuthor.value = 'all';
};

// ================= 网络任务流操作 =================

const handleInstall = async (plugin) => {
    const state = installStates.value[plugin.name];
    if (state.isLoading) return;

    state.isLoading = true;
    state.text = '准备下载...';

    let finalUrl = plugin.downloadUrl;
    const isGithubLink = /^https?:\/\/(github\.com|raw\.githubusercontent\.com)/i.test(finalUrl);

    if (isGithubLink && selectedProxy.value) {
        const prefix = selectedProxy.value.endsWith('/') ? selectedProxy.value : selectedProxy.value + '/';
        finalUrl = prefix + finalUrl;
    }

    try {
        const res = await fetch('/api/plugins/task/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
            body: JSON.stringify({ url: finalUrl })
        });

        const resData = await res.json();

        if (resData.code === 200) {
            startPolling(plugin.name, resData.data.taskId);
        } else if (resData.code === 409) {
            showNotice('系统正在安装其他插件，已接管进度', 'info');
            startPolling(plugin.name, resData.data.runningTaskId);
        } else {
            throw new Error(resData.msg || '提交下载任务失败');
        }
    } catch (error) {
        showNotice(error.message || '网络异常，提交失败', 'error');
        state.isLoading = false;
        state.text = '获取 / 安装';
    }
};

const startPolling = (pluginName, taskId) => {
    if (pollTimer) clearInterval(pollTimer);
    const state = installStates.value[pluginName];

    pollTimer = setInterval(async () => {
        try {
            const res = await fetch(`/api/plugins/task/status/${taskId}`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            const resData = await res.json();

            if (resData.code === 200 && resData.data) {
                const data = resData.data;
                const progress = data.progress !== undefined ? data.progress : 0;

                const actionName = data.status === 'extracting' ? '解压中' : (data.status === 'installing' ? '安装中' : '下载中');
                state.text = `${actionName} ${progress}%`;

                if (data.status === 'success' || data.status === 'error') {
                    clearInterval(pollTimer);
                    pollTimer = null;
                    state.isLoading = false;

                    if (data.status === 'success') {
                        state.text = '安装成功';
                        showNotice(`插件 ${pluginName} 安装成功！`, 'success');
                        await fetchLocalPlugins();
                    } else {
                        state.text = '安装失败';
                        showNotice(data.errorDetail || resData.msg || '安装过程发生错误', 'error');
                    }
                }
            }
        } catch (error) { console.warn('轮询进度失败，继续重试...', error); }
    }, 1000);
};

const handleUpdate = (plugin) => handleInstall(plugin);

const handleUninstall = async (plugin) => {
    // if (confirm(`确定要卸载插件 ${plugin.name} 吗？\n注意：相关的配置文件也会被删除。`)) {
    //     try {
    //         const res = await fetch(`/api/plugins/uninstall/${plugin.name}`, {
    //             method: 'DELETE',
    //             headers: { 'Authorization': `Bearer ${getToken()}` }
    //         });
    //         showNotice(`已成功卸载插件: ${plugin.name}`, 'success');
    //         await fetchLocalPlugins();
    //     } catch (err) {
    //         showNotice('卸载失败', 'error');
    //     }
    // }
    showNotice('功能开发中...，请您手动卸载', 'info')
};
</script>

<style scoped>
.dashboard-content {
    animation: fadeIn 0.4s ease-out;
    max-width: 1100px;
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

/* ================= Header 布局 ================= */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 20px;
}

.section-intro {
    margin-bottom: 0;
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

/* ================= 筛选栏 ================= */
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
    min-width: 200px;
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

/* --- 覆盖 UiSelect 以完美对齐左侧输入框高度 --- */
.filter-select {
    flex-shrink: 0;
}

:deep(.filter-select .select-trigger) {
    min-height: 44px;
    /* 精确匹配左侧搜索框的实际物理高度 */
    padding: 10px 16px;
    font-size: 14px;
}

/* ================= 插件网格 ================= */
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
}

.plugin-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(59, 130, 246, 0.08);
    border-color: #93c5fd;
}

.card-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.p-icon {
    width: 44px;
    height: 44px;
    background: #eff6ff;
    color: #3b82f6;
    border-radius: 12px;
    display: grid;
    place-items: center;
}

.status-badge {
    font-size: 11px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 8px;
    display: flex;
    align-items: center;
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

.status-badge.not-installed {
    background: #f1f5f9;
    color: #64748b;
    border: 1px solid #e2e8f0;
}

.card-body {
    flex: 1;
}

.title-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
}

.title-row h3 {
    font-size: 17px;
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
    display: flex;
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
    cursor: pointer;
    transition: color 0.2s;
}

.author:hover {
    color: #3b82f6;
}

.description {
    font-size: 13px;
    color: #64748b;
    line-height: 1.6;
    margin: 0 0 12px 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    height: 42px;
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
    cursor: pointer;
    transition: background 0.2s;
}

.small-tag:hover {
    background: #dbeafe;
}

.card-footer {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid #f8fafc;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.icon-btn {
    color: #94a3b8;
    display: grid;
    place-items: center;
    padding: 6px;
    border-radius: 8px;
    transition: 0.2s;
}

.icon-btn:hover {
    color: #0f172a;
    background: #f1f5f9;
}

.action-group {
    display: flex;
    gap: 8px;
}

.action-btn {
    border: none;
    outline: none;
    padding: 8px 16px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: 0.2s;
}

.btn-primary {
    background: #3b82f6;
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: #2563eb;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.btn-danger {
    background: #fef2f2;
    color: #ef4444;
}

.btn-danger:hover {
    background: #fee2e2;
    color: #dc2626;
}

.btn-disabled {
    border: none;
    background: #f1f5f9;
    color: #94a3b8;
    padding: 8px 16px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 700;
    cursor: not-allowed;
}

.btn-primary.is-loading {
    background: #93c5fd;
    cursor: wait;
    box-shadow: none;
}

.spin-icon {
    animation: spin 1s linear infinite;
}

.empty-state {
    text-align: center;
    padding: 60px 20px;
    background: #ffffff;
    border-radius: 20px;
    border: 1px dashed #cbd5e1;
    margin-top: 20px;
}

.empty-icon {
    color: #cbd5e1;
    margin-bottom: 16px;
    display: flex;
    justify-content: center;
}

.empty-state h3 {
    font-size: 18px;
    color: #1e293b;
    margin: 0 0 8px 0;
}

.empty-state p {
    color: #64748b;
    font-size: 14px;
    margin: 0 0 24px 0;
}

.reset-filter-btn {
    background: #f1f5f9;
    color: #475569;
    border: none;
    padding: 10px 20px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: 0.2s;
}

.reset-filter-btn:hover {
    background: #e2e8f0;
    color: #0f172a;
}

/* 移动端响应式处理 */
@media (max-width: 768px) {
    .page-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .node-selector-container {
        align-items: flex-start;
        width: 100%;
    }

    .node-selector-wrapper {
        width: 100%;
        justify-content: space-between;
    }

    .node-hint {
        padding-right: 0;
    }

    .filter-bar {
        flex-direction: column;
    }

    .search-box {
        width: 100%;
    }

    .filter-select {
        width: 100% !important;
    }
}
</style>