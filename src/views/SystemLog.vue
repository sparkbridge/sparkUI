<template>
    <div class="dashboard-content">
        <div class="section-intro">
            <h1>系统运行日志</h1>
            <p>实时监控 SparkBridge3 框架与各插件的运行状态与输出流</p>
        </div>

        <div class="log-card">
            <div class="log-toolbar">
                <div class="status-indicator">
                    <div class="pulse-dot" :class="connectionStatus"></div>
                    <span class="status-text">{{ statusText }}</span>
                </div>

                <div class="toolbar-actions">
                    <label class="switch-wrapper">
                        <span class="switch-label">自动滚动</span>
                        <input type="checkbox" class="toggle-switch" v-model="autoScroll" />
                    </label>
                    <div class="divider"></div>
                    <button class="action-btn" @click="scrollToBottom" title="滚动到底部">
                        <ArrowDownIcon :size="16" />
                    </button>
                    <button class="action-btn btn-danger" @click="clearLogs" title="清空面板">
                        <Trash2Icon :size="16" />
                    </button>
                </div>
            </div>

            <div class="terminal-container" ref="terminalRef" @scroll="handleScroll">
                <div v-for="(log, index) in logs" :key="index" class="log-line">
                    <span class="log-time">[{{ formatTime(log.time) }}]</span>
                    <span :class="['log-level', `level-${log.level.toLowerCase()}`]">{{ log.level.toUpperCase()
                        }}</span>
                    <span class="log-plugin">[{{ log.plugin }}]</span>
                    <span class="log-msg" :class="{ 'msg-error': log.level.toLowerCase() === 'error' }">{{ log.msg
                        }}</span>
                </div>

                <div v-if="logs.length === 0 && connectionStatus === 'connected'" class="log-empty">
                    <TerminalSquareIcon :size="32" />
                    <p>暂无日志输出，等待系统中...</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';
import { ArrowDownIcon, Trash2Icon, TerminalSquareIcon } from 'lucide-vue-next';
import { showNotice } from '../utils/notice'; // 假设你依然有这个全局提示方法

const logs = ref([]);
const terminalRef = ref(null);
const autoScroll = ref(true);
let eventSource = null;

// 状态: connecting, connected, error
const connectionStatus = ref('connecting');

const statusText = computed(() => {
    switch (connectionStatus.value) {
        case 'connected': return '实时流已连接';
        case 'connecting': return '正在连接服务器...';
        case 'error': return '连接断开，正在重试';
        default: return '未知状态';
    }
});

// 获取本地 Token
const getToken = () => localStorage.getItem('sb3_token') || localStorage.getItem('user-token') || '';

// 时间格式化 (去掉日期，只留时分秒更清晰)
const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const parts = timeStr.split(' ');
    return parts.length > 1 ? parts[1] : timeStr;
};

// 滚动到底部
const scrollToBottom = async () => {
    await nextTick();
    if (terminalRef.value) {
        terminalRef.value.scrollTop = terminalRef.value.scrollHeight;
    }
};

// 监听用户手动滚动，如果往上滑了，就暂停自动滚动
const handleScroll = () => {
    if (!terminalRef.value) return;
    const { scrollTop, scrollHeight, clientHeight } = terminalRef.value;
    // 如果距离底部超过 50px，认为用户在回看历史，取消自动滚动
    if (scrollHeight - scrollTop - clientHeight > 50) {
        autoScroll.value = false;
    }
};

// 核心：处理新日志推入
const pushLog = (logObj) => {
    logs.value.push(logObj);
    // 限制最大缓存条数，防止网页内存爆炸卡顿
    if (logs.value.length > 1000) {
        logs.value.shift();
    }
    if (autoScroll.value) {
        scrollToBottom();
    }
};

// 1. 获取历史缓存日志
const fetchHistoryLogs = async () => {
    try {
        const res = await fetch('/api/logs', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        const data = await res.json();
        if (data.code === 200 && Array.isArray(data.data)) {
            logs.value = data.data;
            scrollToBottom();
        }
    } catch (err) {
        console.error('拉取历史日志失败:', err);
    }
};

// 2. 建立 SSE 实时连接
const connectStream = () => {
    connectionStatus.value = 'connecting';
    const token = getToken();

    // 原生 EventSource 不支持 Header 传 Token，因此通过 URL query 传递
    eventSource = new EventSource(`/api/logs/stream?token=${token}`);

    eventSource.onopen = () => {
        connectionStatus.value = 'connected';
    };

    eventSource.onmessage = (event) => {
        try {
            const newLog = JSON.parse(event.data);
            pushLog(newLog);
        } catch (e) {
            console.error('日志解析失败:', e);
        }
    };

    eventSource.onerror = () => {
        connectionStatus.value = 'error';
        eventSource.close();
        // 5秒后自动重连
        setTimeout(connectStream, 5000);
    };
};

const clearLogs = () => {
    logs.value = [];
};

onMounted(() => {
    fetchHistoryLogs().then(() => {
        connectStream();
    });
});

onUnmounted(() => {
    if (eventSource) {
        eventSource.close();
    }
});
</script>

<style scoped>
/* =========================================
   复用原 DashBoard.vue 的核心动画与基础布局
   ========================================= */
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

/* =========================================
   日志专有组件样式
   ========================================= */
.log-card {
    background: #ffffff;
    border-radius: 20px;
    padding: 24px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 12px 30px rgba(59, 130, 246, 0.04);
    display: flex;
    flex-direction: column;
    height: calc(100vh - 180px);
    /* 动态高度，撑满屏幕剩余空间 */
    min-height: 500px;
}

/* 顶部工具栏 */
.log-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f1f5f9;
}

/* 状态指示器 */
.status-indicator {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #f8fafc;
    padding: 6px 14px;
    border-radius: 20px;
}

.pulse-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #94a3b8;
}

.pulse-dot.connected {
    background-color: #10b981;
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
    animation: pulse 2s infinite;
}

.pulse-dot.error {
    background-color: #ef4444;
}

@keyframes pulse {
    0% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
    }

    70% {
        transform: scale(1);
        box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
    }

    100% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
    }
}

.status-text {
    font-size: 13px;
    font-weight: 600;
    color: #475569;
}

/* 右侧操作按钮群 */
.toolbar-actions {
    display: flex;
    align-items: center;
    gap: 12px;
}

.divider {
    width: 1px;
    height: 20px;
    background-color: #e2e8f0;
}

/* 复用原有的 Switch 开关样式 */
.switch-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
}

.switch-label {
    font-size: 13px;
    color: #64748b;
    font-weight: 600;
}

.toggle-switch {
    appearance: none;
    position: relative;
    width: 36px;
    height: 20px;
    background: #e2e8f0;
    border-radius: 20px;
    cursor: pointer;
    outline: none;
    transition: background 0.3s;
    margin: 0;
}

.toggle-switch:checked {
    background: #3b82f6;
}

.toggle-switch::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    background: #ffffff;
    border-radius: 50%;
    transition: transform 0.3s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-switch:checked::after {
    transform: translateX(16px);
}

/* 操作按钮 */
.action-btn {
    background: #f1f5f9;
    color: #64748b;
    border: none;
    outline: none;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    cursor: pointer;
    transition: all 0.2s;
}

.action-btn:hover {
    background: #e2e8f0;
    color: #0f172a;
}

.action-btn.btn-danger:hover {
    background: #fee2e2;
    color: #ef4444;
}

/* =========================================
   深色终端显示区
   ========================================= */
.terminal-container {
    flex: 1;
    background-color: #0f172a;
    /* 深蓝色背景，极客感 */
    border-radius: 12px;
    padding: 16px;
    overflow-y: auto;
    font-family: 'Fira Code', Consolas, Monaco, 'Courier New', Courier, monospace;
    font-size: 13px;
    line-height: 1.6;
    color: #cbd5e1;
    box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.2);
}

/* 自定义滚动条 */
.terminal-container::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

.terminal-container::-webkit-scrollbar-track {
    background: transparent;
}

.terminal-container::-webkit-scrollbar-thumb {
    background-color: #334155;
    border-radius: 4px;
}

.terminal-container::-webkit-scrollbar-thumb:hover {
    background-color: #475569;
}

.log-line {
    margin-bottom: 4px;
    word-break: break-all;
    display: flex;
    gap: 8px;
    align-items: flex-start;
}

.log-time {
    color: #64748b;
    flex-shrink: 0;
}

.log-plugin {
    color: #94a3b8;
    flex-shrink: 0;
}

.log-msg {
    flex: 1;
    white-space: pre-wrap;
}

/* 日志级别高亮配色 */
.log-level {
    font-weight: 700;
    width: 45px;
    flex-shrink: 0;
    display: inline-block;
}

.level-info {
    color: #38bdf8;
}

/* 亮蓝 */
.level-warn {
    color: #facc15;
}

/* 亮黄 */
.level-error {
    color: #f87171;
}

/* 亮红 */
.level-debug {
    color: #a7f3d0;
}

/* 浅绿 */

/* 错误消息主体飘红 */
.msg-error {
    color: #fca5a5;
}

/* 无数据占位 */
.log-empty {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #475569;
    gap: 12px;
}
</style>