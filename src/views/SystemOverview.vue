<template>
    <div class="overview-view">

        <div class="overview-grid top-grid">
            <div class="grid-column side-stack">
                <div class="glass-card user-card">
                    <div class="profile-content">
                        <div class="avatar-container">
                            <img :src="`https://q1.qlogo.cn/g?b=qq&nk=${data.qbot.qid || '12345'}&s=640`"
                                alt="avatar" />
                            <div class="status-dot"></div>
                        </div>
                        <div class="user-details">
                            <h3>{{ data.qbot.nickname || '加载中...' }}</h3>
                            <p>QQ: {{ data.qbot.qid || '----' }}</p>
                        </div>
                    </div>
                    <div class="version-badge">
                        <span class="v-tag">核心版本</span>
                        <span class="v-num">v{{ updateInfo.current }}</span>
                    </div>
                </div>

                <div class="glass-card runtime-card auto-fill">
                    <div class="card-header">
                        <CpuIcon :size="16" /> <span>运行环境</span>
                    </div>
                    <div class="property-list">
                        <div class="prop-item"><span class="label">Node.js</span><span class="value">{{
                            data.runtime.nodev }}</span></div>
                        <div class="prop-item"><span class="label">操作系统</span><span class="value">{{ data.runtime.os
                        }}</span></div>
                        <div class="prop-item"><span class="label">运行架构</span><span class="value">{{ data.runtime.arch
                        }}</span></div>
                        <div class="prop-item"><span class="label">进程 PID</span><span class="value">{{ data.runtime.pid
                        }}</span></div>
                    </div>
                </div>
            </div>

            <div class="grid-column">
                <div class="glass-card performance-card full-height">
                    <div class="card-header">
                        <ActivityIcon :size="16" /> <span>资源实时占用</span>
                    </div>
                    <div class="monitor-donuts">
                        <div class="donut-wrapper" :style="`--p: ${parseFloat(data.usage.cpu)}; --c: #3b82f6;`">
                            <svg>
                                <circle cx="65" cy="65" r="55"></circle>
                                <circle cx="65" cy="65" r="55"></circle>
                            </svg>
                            <div class="donut-info">
                                <span class="percent">{{ data.usage.cpu }}</span><span class="sub">CPU 占用</span>
                            </div>
                        </div>
                        <div class="donut-wrapper" :style="`--p: ${parseFloat(data.usage.mem)}; --c: #60a5fa;`">
                            <svg>
                                <circle cx="65" cy="65" r="55"></circle>
                                <circle cx="65" cy="65" r="55"></circle>
                            </svg>
                            <div class="donut-info">
                                <span class="percent">{{ data.usage.mem }}</span><span class="sub">内存占用</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid-column">
                <div class="glass-card connection-card full-height">
                    <div class="card-header">
                        <GlobeIcon :size="16" /> <span>网络连接详情</span>
                    </div>

                    <div class="network-visualizer">
                        <div class="pulse-ring"></div>
                        <div class="pulse-ring delay"></div>
                        <div class="center-orb">
                            <ArrowDownUpIcon :size="24" class="wifi-icon" />
                        </div>
                    </div>

                    <div class="property-list">
                        <div class="prop-item"><span class="label">内网 IP</span><span class="value">{{ data.network.ip
                        }}</span></div>
                        <div class="prop-item"><span class="label">服务端口</span><span class="value">{{ data.network.port
                        }}</span></div>
                        <div class="prop-item"><span class="label">协议类型</span><span class="value">{{
                            data.network.protocol }}</span></div>
                        <div class="prop-item"><span class="label">心跳状态</span><span class="value status-ok">{{
                            data.network.heartbeat }}</span></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="overview-grid bottom-grid">

            <div class="glass-card notice-card">
                <div class="card-header space-between">
                    <div class="title-left">
                        <MegaphoneIcon :size="16" /> <span>系统公告 & 动态</span>
                    </div>
                    <button class="btn-text" v-if="announcements.length > 0">查看全部</button>
                </div>

                <div class="notice-list">
                    <template v-if="announcements.length > 0">
                        <div v-for="item in announcements" :key="item.id" class="notice-item">
                            <div class="notice-tag" :class="item.type">{{ item.tag }}</div>
                            <div class="notice-title">{{ item.title }}</div>
                            <div class="notice-date">{{ item.date }}</div>
                        </div>
                    </template>

                    <div v-else class="empty-notice">
                        <InboxIcon :size="32" />
                        <span>暂无最新公告</span>
                    </div>
                </div>
            </div>

            <div class="glass-card update-card">
                <div class="card-header">
                    <RefreshCwIcon :size="16" /> <span>版本与更新</span>
                </div>
                <div class="update-content">
                    <div class="version-compare">
                        <div class="v-box">
                            <span class="v-lbl">当前版本</span>
                            <span class="v-val">{{ updateInfo.current }}</span>
                        </div>
                        <ArrowRightIcon :size="20" class="v-arrow" />
                        <div class="v-box">
                            <span class="v-lbl">最新版本</span>
                            <span class="v-val" :class="{ 'highlight': updateInfo.hasUpdate }">{{ updateInfo.latest ||
                                '...'
                                }}</span>
                        </div>
                    </div>

                    <div class="update-status-msg" :class="{ 'has-update': updateInfo.hasUpdate }">
                        <span v-if="updateInfo.isChecking">
                            <LoaderIcon class="spin" :size="14" /> 正在检测新版本...
                        </span>
                        <span v-else-if="updateInfo.hasUpdate">
                            <ZapIcon :size="14" /> 发现新版本，建议立即更新！
                        </span>
                        <span v-else>
                            <CheckCircleIcon :size="14" /> 当前已是最新版本
                        </span>
                    </div>

                    <button class="btn-primary update-btn" :disabled="updateInfo.isChecking" @click="checkUpdate">
                        <RefreshCwIcon :size="16" :class="{ 'spin': updateInfo.isChecking }" />
                        {{ updateInfo.isChecking ? '检测中...' : (updateInfo.hasUpdate ? '立即更新' : '检查更新') }}
                    </button>
                </div>
            </div>
        </div>

        <footer class="quote-card">
            <QuoteIcon :size="32" class="quote-icon" />
            <div class="quote-wrap" :class="{ 'fade': isQuoteLoading }">
                <p class="quote-text">“ {{ quote.text }} ”</p>
                <p class="quote-author">—— {{ quote.from }}</p>
            </div>
        </footer>
    </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import {
    CpuIcon, ActivityIcon, GlobeIcon, QuoteIcon, MegaphoneIcon,
    RefreshCwIcon, ArrowRightIcon, ZapIcon, CheckCircleIcon, LoaderIcon,
    ArrowDownUpIcon, InboxIcon // 引入 InboxIcon 作为空状态图标
} from 'lucide-vue-next';
import { api } from '../api';

// =====================================
// API 接口地址配置 (请替换为你的真实链接)
// =====================================
const ANNOUNCEMENT_URL = 'https://sparkbridge.cn/v1/announcements.json';
const LATEST_VERSION_URL = 'https://sparkbridge.cn/v1/version/latest.json';

// 1. 核心监控数据
const data = ref({
    qbot: { qid: '', nickname: '', version: '1.0.0' },
    runtime: { os: '-', nodev: '-', pid: '-', arch: '-' },
    usage: { cpu: '0%', mem: '0%' },
    network: { ip: '-', port: '-', protocol: '-', heartbeat: '-' }
});

// 2. 公告数据
const announcements = ref([]);

// 3. 更新检测状态
const updateInfo = reactive({
    current: '1.0.0',
    latest: '1.0.0',
    isChecking: false,
    hasUpdate: false
});

const loadOverview = async () => {
    try {
        const res = await api.getOverview();
        if (res && res.code === 200) {
            data.value = res.data;
            // 获取本地当前版本
            updateInfo.current = res.data.qbot?.version || '1.0.0';
            updateInfo.latest = updateInfo.current; // 初始状态下假设最新版本就是当前版本

            // 数据加载完后，静默检测一次更新
            checkUpdate(true);
        }
    } catch (err) {
        console.error('获取系统概览失败', err);
    }
};

// 获取公告方法
const fetchAnnouncements = async () => {
    try {
        const res = await fetch(ANNOUNCEMENT_URL);
        if (!res.ok) throw new Error('网络响应错误');

        const resData = await res.json();
        // 假设返回的数据是一个数组，或者在 resData.data 中。请根据实际情况调整：
        const list = resData.data || resData;

        if (Array.isArray(list) && list.length > 0) {
            announcements.value = list;
        } else {
            announcements.value = []; // 数据为空
        }
    } catch (error) {
        console.error('获取公告失败，降级显示暂无公告', error);
        announcements.value = []; // 检测失败，显示暂无公告
    }
};

// 检测更新方法 (isSilent: 是否为静默检测)
const checkUpdate = async (isSilent = false) => {
    updateInfo.isChecking = true;
    try {
        const res = await fetch(LATEST_VERSION_URL);
        if (!res.ok) throw new Error('网络响应错误');

        const resData = await res.json();
        // 假设接口返回 { data: { version: '1.0.5' } } 或 { version: '1.0.5' }
        const latestVer = resData.data?.version || resData.version;

        if (latestVer) {
            updateInfo.latest = latestVer;
            // 简单的版本比对 (只要不一样就认为有更新，你也可以引入 semver 库做精确比对)
            updateInfo.hasUpdate = latestVer !== updateInfo.current;
        } else {
            throw new Error('未获取到版本号字段');
        }
    } catch (error) {
        if (!isSilent) console.warn('版本检测失败，当作最新版本处理', error);
        // 降级处理：获取失败时，将最新版本置为当前版本，显示“已为最新”
        updateInfo.latest = updateInfo.current;
        updateInfo.hasUpdate = false;
    } finally {
        updateInfo.isChecking = false;
    }
};

// 4. 一言名言
const isQuoteLoading = ref(true);
const quote = reactive({ text: '正在感悟人生...', from: '' });

const loadQuote = async () => {
    isQuoteLoading.value = true;
    try {
        const r = await fetch('https://v1.hitokoto.cn/');
        const d = await r.json();
        quote.text = d.hitokoto;
        quote.from = d.from;
    } catch (e) { quote.text = '数据不仅是冷冰冰的数字，更是系统的灵魂。'; }
    finally { isQuoteLoading.value = false; }
};

onMounted(() => {
    loadOverview();
    fetchAnnouncements();
    loadQuote();
});
</script>

<style scoped>
/* 原有的样式完全保留，追加了公告空状态的样式 */
/* ... (请将上文中的所有 css 粘贴到这里) ... */

/* 新增：公告空状态样式 */
.empty-notice {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 40px 0;
    color: #cbd5e1;
    font-size: 13px;
    font-weight: 500;
}

.empty-notice span {
    color: #94a3b8;
}

/* 确保剩下的原有 CSS 都在下面 */
.overview-view {
    display: flex;
    flex-direction: column;
    gap: 24px;
    animation: fadeIn 0.4s ease;
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

.overview-grid {
    display: grid;
    gap: 24px;
    align-items: stretch;
}

.top-grid {
    grid-template-columns: 280px 1.2fr 1fr;
}

.bottom-grid {
    grid-template-columns: 1.6fr 1fr;
}

.side-stack {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.auto-fill {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.full-height {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.glass-card {
    background: #ffffff;
    border-radius: 24px;
    padding: 24px;
    border: 1px solid #eef2f6;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
    transition: 0.3s;
}

.card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
    color: #64748b;
    font-weight: 700;
    font-size: 14px;
}

.space-between {
    justify-content: space-between;
}

.btn-text {
    background: transparent;
    border: none;
    color: #3b82f6;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 6px;
    transition: 0.2s;
}

.btn-text:hover {
    background: #eff6ff;
}

.profile-content {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
}

.avatar-container {
    position: relative;
    width: 56px;
    height: 56px;
    margin-right: 16px;
}

.avatar-container img {
    width: 100%;
    border-radius: 16px;
    object-fit: cover;
}

.status-dot {
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 12px;
    height: 12px;
    background: #10b981;
    border: 2px solid #fff;
    border-radius: 50%;
}

.user-details h3 {
    font-size: 17px;
    margin: 0;
    color: #1e293b;
}

.user-details p {
    font-size: 12px;
    color: #94a3b8;
    margin: 2px 0 0;
}

.version-badge {
    display: inline-flex;
    align-items: center;
    border-radius: 8px;
    overflow: hidden;
    font-size: 11px;
    font-weight: 700;
}

.v-tag {
    background: #3b82f6;
    color: white;
    padding: 3px 8px;
}

.v-num {
    background: #eff6ff;
    color: #3b82f6;
    padding: 3px 10px;
}

.property-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.prop-item {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    padding-bottom: 10px;
    border-bottom: 1px solid #f8fafc;
}

.prop-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
}

.label {
    color: #94a3b8;
}

.value {
    color: #1e293b;
    font-weight: 600;
}

.status-ok {
    color: #10b981;
}

.monitor-donuts {
    flex: 1;
    display: flex;
    justify-content: space-around;
    align-items: center;
}

.donut-wrapper {
    position: relative;
    width: 130px;
    height: 130px;
}

.donut-wrapper svg {
    width: 130px;
    height: 130px;
    transform: rotate(-90deg);
}

.donut-wrapper circle {
    fill: none;
    stroke-width: 10;
    stroke-linecap: round;
    cx: 65;
    cy: 65;
    r: 55;
}

.donut-wrapper circle:nth-child(1) {
    stroke: #f1f5f9;
}

.donut-wrapper circle:nth-child(2) {
    stroke: var(--c);
    stroke-dasharray: 345;
    stroke-dashoffset: calc(345 - (345 * var(--p)) / 100);
    transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.donut-info {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.percent {
    font-size: 20px;
    font-weight: 800;
    color: #1e293b;
}

.sub {
    font-size: 10px;
    color: #94a3b8;
    font-weight: 600;
}

.notice-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 120px;
}

.notice-item {
    display: flex;
    align-items: center;
    padding: 12px;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid #f1f5f9;
    transition: 0.2s;
    cursor: pointer;
}

.notice-item:hover {
    background: #ffffff;
    border-color: #e2e8f0;
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

.notice-tag {
    font-size: 10px;
    font-weight: 700;
    padding: 4px 8px;
    border-radius: 6px;
    margin-right: 12px;
    flex-shrink: 0;
}

.notice-tag.info {
    background: #eff6ff;
    color: #3b82f6;
}

.notice-tag.warning {
    background: #fff7ed;
    color: #ea580c;
}

.notice-tag.success {
    background: #f0fdf4;
    color: #16a34a;
}

.notice-title {
    flex: 1;
    font-size: 13px;
    color: #334155;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.notice-date {
    font-size: 12px;
    color: #94a3b8;
    margin-left: 16px;
    font-family: 'Fira Code', monospace;
}

.update-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    justify-content: center;
    align-items: center;
    gap: 20px;
}

.version-compare {
    display: flex;
    align-items: center;
    gap: 24px;
    background: #f8fafc;
    padding: 20px 32px;
    border-radius: 16px;
    border: 1px solid #f1f5f9;
    width: 100%;
    justify-content: center;
}

.v-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}

.v-lbl {
    font-size: 11px;
    color: #94a3b8;
    font-weight: 700;
}

.v-val {
    font-size: 24px;
    font-weight: 800;
    color: #1e293b;
    font-family: 'Fira Code', monospace;
}

.v-val.highlight {
    color: #3b82f6;
}

.v-arrow {
    color: #cbd5e1;
}

.update-status-msg {
    font-size: 13px;
    font-weight: 600;
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 6px;
    height: 20px;
}

.update-status-msg.has-update {
    color: #ef4444;
}

.btn-primary.update-btn {
    width: 100%;
    background: #3b82f6;
    color: white;
    padding: 14px;
    border-radius: 14px;
    border: none;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    transition: 0.3s;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.btn-primary.update-btn:hover:not(:disabled) {
    background: #2563eb;
    transform: translateY(-2px);
}

.btn-primary.update-btn:disabled {
    background: #94a3b8;
    cursor: not-allowed;
    box-shadow: none;
}

.connection-card {
    display: flex;
    flex-direction: column;
}

.network-visualizer {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    min-height: 100px;
}

.pulse-ring {
    position: absolute;
    width: 50px;
    height: 50px;
    border: 2px solid #3b82f6;
    border-radius: 50%;
    animation: ripple 2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
    opacity: 0;
}

.pulse-ring.delay {
    animation-delay: 1s;
}

@keyframes ripple {
    0% {
        transform: scale(0.8);
        opacity: 0.6;
    }

    100% {
        transform: scale(2.5);
        opacity: 0;
    }
}

.center-orb {
    position: relative;
    z-index: 2;
    width: 48px;
    height: 48px;
    background: #eff6ff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 0 4px white, 0 4px 12px rgba(59, 130, 246, 0.2);
}

.wifi-icon {
    color: #3b82f6;
}

@keyframes spin {
    100% {
        transform: rotate(360deg);
    }
}

.quote-card {
    background: white;
    border-radius: 24px;
    padding: 32px;
    text-align: center;
    border: 1px solid #f1f5f9;
    position: relative;
}

.quote-icon {
    position: absolute;
    top: 15px;
    left: 20px;
    color: #3b82f6;
    opacity: 0.05;
}

.quote-text {
    font-size: 18px;
    font-style: italic;
    color: #334155;
    margin-bottom: 12px;
}

.quote-author {
    color: #ef4444;
    font-weight: 800;
    font-size: 13px;
}

@media (max-width: 1200px) {
    .top-grid {
        grid-template-columns: 1fr 1fr;
    }

    .side-stack {
        grid-column: span 2;
        flex-direction: row;
    }

    .bottom-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .top-grid {
        grid-template-columns: 1fr;
    }

    .side-stack {
        flex-direction: column;
        grid-column: span 1;
    }

    .version-compare {
        padding: 16px;
        gap: 12px;
    }
}
</style>