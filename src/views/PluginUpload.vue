<template>
    <div class="dashboard-content">
        <div class="section-intro">
            <h1>安装插件</h1>
            <p>上传本地 ZIP 格式的插件包并自动部署到系统</p>
        </div>

        <div class="tips-group">
            <div class="alert-box beta-alert">
                <div class="alert-icon-box">
                    <FlaskConicalIcon :size="20" />
                </div>
                <div class="alert-content">
                    <strong>Web 上传器 (Beta)</strong>
                    <p>当前在线安装功能处于测试阶段。如遇大文件解析超时或网络报错，请尝试手动将解压后的插件文件夹放入 <code>plugins/</code> 目录并重启系统。</p>
                </div>
            </div>

            <div class="alert-box link-alert">
                <div class="alert-icon-box">
                    <CompassIcon :size="20" />
                </div>
                <div class="alert-content">
                    <strong>不知道去哪里寻找插件？</strong>
                    <p>前往 <a href="https://sparkbridge.cn/user/store" target="_blank" class="text-link">SparkBridge 插件社区
                            <ExternalLinkIcon :size="12" />
                        </a> 或者<a href="https://www.minebbs.com/resources/categories/bdserver.38/" target="_blank" class="text-link">Minebbs
                            <ExternalLinkIcon :size="12" />
                        </a>
                        
                        探索并下载由官方与开发者们提供的优质扩展功能。</p>
                </div>
            </div>
        </div>

        <div class="upload-container">
            <div class="plugin-card upload-card">

                <input type="file" ref="fileInput" accept=".zip" class="hidden-input" @change="handleFileChange" />

                <div class="dropzone" :class="{ 'is-dragover': isDragOver }" @dragover.prevent="isDragOver = true"
                    @dragleave.prevent="isDragOver = false" @drop.prevent="handleDrop" @click="triggerSelect"
                    v-if="currentView === 'idle'">
                    <div class="icon-wrapper">
                        <PackagePlusIcon :size="48" stroke-width="1.5" />
                    </div>
                    <h3>点击或拖拽上传 ZIP 文件</h3>
                    <p>仅支持标准 .zip 格式，后台将自动进行解压与校验</p>
                </div>

                <div class="file-preview" v-if="currentView === 'preview'">
                    <div class="file-info-box">
                        <div class="file-icon">
                            <FileArchiveIcon :size="32" />
                        </div>
                        <div class="file-details">
                            <h4>{{ selectedFile.name }}</h4>
                            <span>{{ formatFileSize(selectedFile.size) }}</span>
                        </div>
                        <button class="remove-btn" @click.stop="resetUpload">
                            <XIcon :size="20" />
                        </button>
                    </div>

                    <div class="action-row">
                        <button class="primary-action-btn" @click="submitUploadTask">
                            <UploadCloudIcon :size="18" />
                            提交并开始安装
                        </button>
                    </div>
                </div>

                <div class="processing-view" v-if="currentView === 'processing'">
                    <div class="status-icon-box pulse-anim">
                        <component :is="currentStatusIcon" :size="40" stroke-width="1.5" />
                    </div>

                    <h3 class="processing-title">{{ taskMessage || '正在处理任务...' }}</h3>

                    <div class="progress-container">
                        <div class="progress-bar-bg">
                            <div class="progress-bar-fill" :style="{ width: `${taskProgress}%` }"></div>
                        </div>
                        <div class="progress-text">{{ taskProgress }}%</div>
                    </div>
                    <p class="processing-subtext">后台正在执行，您可以离开此页面，任务不会中断。</p>
                </div>

                <div class="result-view" v-if="currentView === 'result'">
                    <div class="result-icon" :class="uploadResult.status === 'success' ? 'success' : 'error'">
                        <CheckCircleIcon v-if="uploadResult.status === 'success'" :size="56" />
                        <AlertTriangleIcon v-else :size="56" />
                    </div>

                    <h3 class="result-title">{{ uploadResult.status === 'success' ? '安装成功' : '安装失败' }}</h3>

                    <p class="result-msg" v-if="uploadResult.status === 'success'">
                        {{ uploadResult.msg }}
                    </p>

                    <div class="error-detail-box" v-if="uploadResult.status === 'error'">
                        {{ uploadResult.errorDetail || uploadResult.msg || '发生未知错误' }}
                    </div>

                    <div class="meta-box" v-if="uploadResult.status === 'success' && uploadResult.plugin">
                        <div class="meta-item">
                            <span class="m-label">插件标识:</span>
                            <span class="m-value">{{ uploadResult.plugin.name }}</span>
                        </div>
                        <div class="meta-item">
                            <span class="m-label">版本号:</span>
                            <span class="m-value v-tag">v{{ uploadResult.plugin.version }}</span>
                        </div>
                    </div>

                    <button class="primary-action-btn reset-btn" @click="resetUpload">
                        继续安装其他插件
                    </button>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import {
    UploadCloudIcon, FileArchiveIcon, XIcon,
    CheckCircleIcon, AlertTriangleIcon, PackagePlusIcon,
    BoxIcon, FileSearchIcon, HardDriveIcon, CpuIcon,
    FlaskConicalIcon, CompassIcon, ExternalLinkIcon // 新增引入提示栏所需的图标
} from 'lucide-vue-next';
import { showNotice } from '../utils/notice';

// --- 状态控制 ---
const fileInput = ref(null);
const selectedFile = ref(null);
const isDragOver = ref(false);
const currentView = ref('idle');

// --- 任务状态数据 ---
const activeTaskId = ref('');
const taskStatus = ref('');
const taskProgress = ref(0);
const taskMessage = ref('');
const uploadResult = ref(null);
let pollTimer = null;

const currentStatusIcon = computed(() => {
    switch (taskStatus.value) {
        case 'extracting': return BoxIcon;
        case 'validating': return FileSearchIcon;
        case 'installing': return HardDriveIcon;
        default: return CpuIcon;
    }
});

const getToken = () => localStorage.getItem('sb3_token') || localStorage.getItem('user-token') || '';
const getHeaders = () => ({ 'Authorization': `Bearer ${getToken()}` });

onMounted(() => checkCurrentState());
onUnmounted(() => stopPolling());

const checkCurrentState = async () => {
    try {
        const res = await fetch('/api/plugins/task/current', { headers: getHeaders() });
        const resData = await res.json();

        if (resData.code === 200 && resData.data) {
            if (resData.data.isBusy) {
                const task = resData.data.currentTask;
                activeTaskId.value = task.taskId;
                taskStatus.value = task.status;
                taskProgress.value = task.progress || 0;
                taskMessage.value = task.msg;
                currentView.value = 'processing';
                startPolling();
            }
        }
    } catch (e) {
        console.error('检查状态失败', e);
    }
};

const triggerSelect = () => fileInput.value?.click();

const validateFile = (file) => {
    if (!file.name.toLowerCase().endsWith('.zip')) {
        showNotice('格式错误：只能上传 .zip 格式的压缩包', 'error');
        return false;
    }
    return true;
};

const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && validateFile(file)) {
        selectedFile.value = file;
        currentView.value = 'preview';
    }
    e.target.value = '';
};

const handleDrop = (e) => {
    isDragOver.value = false;
    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
        selectedFile.value = file;
        currentView.value = 'preview';
    }
};

const resetUpload = () => {
    selectedFile.value = null;
    uploadResult.value = null;
    currentView.value = 'idle';
    taskProgress.value = 0;
};

const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const submitUploadTask = async () => {
    if (!selectedFile.value) return;

    currentView.value = 'processing';
    taskMessage.value = '正在上传文件至服务器...';
    taskProgress.value = 0;
    taskStatus.value = 'uploading';

    const formData = new FormData();
    formData.append('pluginFile', selectedFile.value);

    try {
        const response = await fetch('/api/plugins/task/upload', {
            method: 'POST',
            headers: getHeaders(),
            body: formData
        });

        const resData = await response.json();

        if (resData.code === 200) {
            activeTaskId.value = resData.data.taskId;
            startPolling();
        } else if (resData.code === 409) {
            showNotice('当前系统繁忙，自动接管现有任务进度', 'info');
            activeTaskId.value = resData.data.runningTaskId;
            startPolling();
        } else {
            throw new Error(resData.msg || '提交任务失败');
        }
    } catch (error) {
        currentView.value = 'result';
        uploadResult.value = { status: 'error', errorDetail: error.message };
        showNotice('上传失败', 'error');
    }
};

const startPolling = () => {
    if (pollTimer) clearInterval(pollTimer);

    pollTimer = setInterval(async () => {
        if (!activeTaskId.value) return;

        try {
            const res = await fetch(`/api/plugins/task/status/${activeTaskId.value}`, {
                headers: getHeaders()
            });
            const resData = await res.json();

            if (resData.code === 200 && resData.data) {
                const data = resData.data;
                taskStatus.value = data.status;
                taskMessage.value = resData.msg;
                if (data.progress !== undefined) {
                    taskProgress.value = data.progress;
                }

                if (data.status === 'success' || data.status === 'error') {
                    stopPolling();
                    finishTask(data);
                }
            }
        } catch (error) {
            console.error('轮询请求失败', error);
        }
    }, 1000);
};

const stopPolling = () => {
    if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
    }
};

const finishTask = (finalData) => {
    uploadResult.value = finalData;
    taskProgress.value = finalData.status === 'success' ? 100 : taskProgress.value;
    setTimeout(() => {
        currentView.value = 'result';
        if (finalData.status === 'success') {
            showNotice('插件安装成功！', 'success');
        }
    }, 500);
};
</script>

<style scoped>
.dashboard-content {
    animation: fadeIn 0.4s ease-out;
    max-width: 800px;
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
    margin-bottom: 24px;
}

/* 稍微缩减了底部边距，给提示框腾出空间 */
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

/* ================= 新增：提示框样式 ================= */
.tips-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
}

.alert-box {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 16px 20px;
    border-radius: 16px;
    border: 1px solid transparent;
}

.alert-icon-box {
    margin-top: 2px;
}

.alert-content {
    flex: 1;
}

.alert-content strong {
    display: block;
    font-size: 14px;
    margin-bottom: 6px;
}

.alert-content p {
    margin: 0;
    font-size: 13px;
    line-height: 1.6;
}

/* Beta 测试版警告配色 (橙黄色) */
.beta-alert {
    background-color: #fffbeb;
    border-color: #fde68a;
}

.beta-alert .alert-icon-box {
    color: #d97706;
}

.beta-alert strong {
    color: #92400e;
}

.beta-alert p {
    color: #b45309;
}

.beta-alert code {
    background: rgba(217, 119, 6, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
}

/* 链接指引提示配色 (薄荷绿) */
.link-alert {
    background-color: #ecfdf5;
    border-color: #a7f3d0;
}

.link-alert .alert-icon-box {
    color: #10b981;
}

.link-alert strong {
    color: #064e3b;
}

.link-alert p {
    color: #047857;
}

/* 超链接样式 */
.text-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: #059669;
    font-weight: 700;
    text-decoration: none;
    background: rgba(16, 185, 129, 0.15);
    padding: 2px 8px;
    border-radius: 6px;
    transition: all 0.2s;
    margin: 0 4px;
}

.text-link:hover {
    background: rgba(16, 185, 129, 0.25);
    transform: translateY(-1px);
}

/* ================================================= */

.upload-card {
    background: #ffffff;
    border-radius: 20px;
    padding: 32px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.02);
    min-height: 280px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.hidden-input {
    display: none;
}

.dropzone {
    border: 2px dashed #cbd5e1;
    border-radius: 16px;
    padding: 60px 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    background: #f8fafc;
}

.dropzone:hover,
.dropzone.is-dragover {
    border-color: #3b82f6;
    background: #eff6ff;
}

.dropzone .icon-wrapper {
    color: #94a3b8;
    margin-bottom: 16px;
    transition: color 0.3s;
}

.dropzone:hover .icon-wrapper,
.dropzone.is-dragover .icon-wrapper {
    color: #3b82f6;
}

.dropzone h3 {
    font-size: 18px;
    color: #1e293b;
    margin: 0 0 8px 0;
    font-weight: 600;
}

.dropzone p {
    font-size: 13px;
    color: #64748b;
    margin: 0;
}

.file-preview {
    display: flex;
    flex-direction: column;
    gap: 24px;
    animation: fadeIn 0.3s;
}

.file-info-box {
    display: flex;
    align-items: center;
    padding: 20px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    gap: 16px;
}

.file-icon {
    width: 48px;
    height: 48px;
    background: #eff6ff;
    color: #3b82f6;
    border-radius: 12px;
    display: grid;
    place-items: center;
}

.file-details {
    flex: 1;
    overflow: hidden;
}

.file-details h4 {
    margin: 0 0 4px 0;
    font-size: 16px;
    color: #0f172a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.file-details span {
    font-size: 13px;
    color: #64748b;
}

.remove-btn {
    background: none;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: 0.2s;
}

.remove-btn:hover {
    background: #f1f5f9;
    color: #ef4444;
}

.action-row {
    display: flex;
    justify-content: center;
}

.processing-view {
    text-align: center;
    padding: 20px 0;
    animation: fadeIn 0.4s;
}

.status-icon-box {
    width: 80px;
    height: 80px;
    background: #eff6ff;
    color: #3b82f6;
    border-radius: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto 20px auto;
}

.pulse-anim {
    animation: softPulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
}

@keyframes softPulse {

    0%,
    100% {
        opacity: 1;
        transform: scale(1);
    }

    50% {
        opacity: 0.8;
        transform: scale(0.95);
        box-shadow: 0 0 0 10px rgba(59, 130, 246, 0.1);
    }
}

.processing-title {
    font-size: 18px;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 24px 0;
}

.progress-container {
    display: flex;
    align-items: center;
    gap: 16px;
    max-width: 500px;
    margin: 0 auto;
}

.progress-bar-bg {
    flex: 1;
    height: 12px;
    background: #f1f5f9;
    border-radius: 10px;
    overflow: hidden;
    position: relative;
}

.progress-bar-fill {
    height: 100%;
    background: #3b82f6;
    border-radius: 10px;
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
    background-size: 1rem 1rem;
    animation: progressStripe 1s linear infinite;
}

@keyframes progressStripe {
    from {
        background-position: 1rem 0;
    }

    to {
        background-position: 0 0;
    }
}

.progress-text {
    font-size: 14px;
    font-weight: 700;
    color: #3b82f6;
    width: 40px;
    text-align: right;
}

.processing-subtext {
    margin-top: 24px;
    font-size: 13px;
    color: #94a3b8;
}

.result-view {
    text-align: center;
    padding: 20px 0;
    animation: fadeIn 0.4s;
}

.result-icon {
    margin-bottom: 16px;
}

.result-icon.success {
    color: #10b981;
}

.result-icon.error {
    color: #ef4444;
}

.result-title {
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 12px 0;
}

.result-msg {
    font-size: 14px;
    color: #64748b;
    margin: 0 0 24px 0;
}

.error-detail-box {
    background-color: #fef2f2;
    border: 1px solid #fecaca;
    color: #ef4444;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 13px;
    line-height: 1.5;
    max-width: 400px;
    margin: 0 auto 24px auto;
    text-align: left;
    font-family: 'Fira Code', monospace;
    word-break: break-all;
}

.meta-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px;
    max-width: 360px;
    margin: 0 auto 24px auto;
    text-align: left;
}

.meta-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
}

.meta-item:last-child {
    margin-bottom: 0;
}

.m-label {
    width: 80px;
    font-size: 13px;
    color: #64748b;
}

.m-value {
    font-size: 14px;
    color: #0f172a;
    font-weight: 600;
}

.v-tag {
    font-size: 12px;
    font-family: 'Fira Code', monospace;
    background: #e2e8f0;
    color: #475569;
    padding: 2px 8px;
    border-radius: 6px;
}

.primary-action-btn {
    background: #3b82f6;
    color: #ffffff;
    border: none !important;
    outline: none !important;
    padding: 14px 32px;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: 0.2s;
    width: 100%;
    max-width: 300px;
}

.primary-action-btn:hover {
    background: #2563eb;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.25);
}

.reset-btn {
    background: #f1f5f9;
    color: #475569;
    max-width: 200px;
    margin: 0 auto;
}

.reset-btn:hover {
    background: #e2e8f0;
    box-shadow: none;
    transform: none;
}
</style>