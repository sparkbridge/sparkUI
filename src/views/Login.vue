<template>
    <div class="login-view">
        <div class="bg-glow glow-1"></div>
        <div class="bg-glow glow-2"></div>

        <div class="login-card glass-panel">

            <div class="avatar-section">
                <div class="avatar-wrapper">
                    <img src="/public/spark.jpg" alt="Project Mascot" class="avatar-img" />

                    <div class="ring-pulse"></div>
                    <div class="ring-pulse delay"></div>
                </div>
            </div>

            <div class="welcome-text">
                <h2>欢迎回来，主理人</h2>
                <p>SparkBridge3 自动化控制中心</p>
            </div>

            <form class="login-form" @submit.prevent="handleLogin">

                <div class="input-group" :class="{ 'is-focused': isFocused, 'has-error': errMsg }">
                    <div class="input-icon">
                        <LockIcon :size="18" />
                    </div>
                    <input type="password" v-model="password" placeholder="请输入控制台密码" class="password-input"
                        @focus="isFocused = true; errMsg = ''" @blur="isFocused = false" required />
                </div>

                <transition name="fade-slide">
                    <div v-if="errMsg" class="error-message">
                        <AlertCircleIcon :size="14" />
                        <span>{{ errMsg }}</span>
                    </div>
                </transition>

                <button type="submit" class="btn-primary login-btn" :disabled="loading">
                    <span v-if="!loading">进入控制台</span>
                    <LoaderIcon v-else class="spin" :size="18" />
                    <ArrowRightIcon v-if="!loading" :size="18" class="arrow-icon" />
                </button>
            </form>

        </div>

        <div class="login-footer">
            © 2026 SparkBridge3 Core System. All rights reserved.
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
// 引入 AlertCircleIcon 用于错误提示
import { LockIcon, ArrowRightIcon, LoaderIcon, AlertCircleIcon } from 'lucide-vue-next';
import { api } from '../api';
import { showNotice } from '../utils/notice';

const router = useRouter();
const password = ref('');
const isFocused = ref(false);

// 完全使用你提供的变量名和业务逻辑
const loading = ref(false);
const errMsg = ref('');

const handleLogin = async () => {
    if (!password.value) return;
    loading.value = true;
    errMsg.value = '';

    try {
        const res = await api.login(password.value);
        console.log(res);
        if (res.code == 200) {
            localStorage.setItem('sb3_token', res.token);
            showNotice('登录成功，欢迎回来', "success");
            setTimeout(() => {
                router.push('/overview');
            }, 100);

        } else {
            errMsg.value = '密码不正确，请重试';
        }
    } catch (e) {
        console.error(e);
        // 如果后端有返回具体的响应数据，优先显示后端的提示
        if (e.response && e.response.data && e.response.data.msg) {
            errMsg.value = e.response.data.msg;
        } else {
            errMsg.value = '密码错误或网络异常';
        }
    } finally {
        loading.value = false; // 拦截器放行后，这行终于可以正常执行了！
    }
};
</script>

<style scoped>
/* ==========================================
   1. 整体布局与动态背景
   ========================================== */
.login-view {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #f1f5f9;
    position: relative;
    overflow: hidden;
}

.bg-glow {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    z-index: 0;
    opacity: 0.5;
}

.glow-1 {
    width: 400px;
    height: 400px;
    background: #bfdbfe;
    top: -100px;
    left: -100px;
    animation: float 8s ease-in-out infinite alternate;
}

.glow-2 {
    width: 300px;
    height: 300px;
    background: #ddd6fe;
    bottom: 10%;
    right: 10%;
    animation: float 10s ease-in-out infinite alternate-reverse;
}

@keyframes float {
    0% {
        transform: translate(0, 0);
    }

    100% {
        transform: translate(50px, 50px);
    }
}

/* ==========================================
   2. 居中磨砂卡片
   ========================================== */
.login-card {
    width: 100%;
    max-width: 380px;
    padding: 40px 32px;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 28px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02);
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* ==========================================
   3. 虚拟形象区域 (已去除状态小绿点)
   ========================================== */
.avatar-section {
    margin-bottom: 24px;
}

.avatar-wrapper {
    position: relative;
    width: 96px;
    height: 96px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: white;
    padding: 4px;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.avatar-img {
    width: 100%;
    height: 100%;
    aspect-ratio: 1 / 1;
    object-fit: cover;
    border-radius: 50%;
    z-index: 2;
    border: 2px solid #eff6ff;
}

.ring-pulse {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid #3b82f6;
    opacity: 0;
    z-index: 1;
    animation: pulse-ring 3s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
}

.ring-pulse.delay {
    animation-delay: 1.5s;
}

@keyframes pulse-ring {
    0% {
        transform: scale(0.95);
        opacity: 0.8;
        border-width: 2px;
    }

    100% {
        transform: scale(1.4);
        opacity: 0;
        border-width: 0px;
    }
}

/* ==========================================
   4. 文本与表单区域
   ========================================== */
.welcome-text {
    text-align: center;
    margin-bottom: 32px;
}

.welcome-text h2 {
    margin: 0;
    font-size: 20px;
    color: #1e293b;
    font-weight: 800;
    letter-spacing: 0.5px;
}

.welcome-text p {
    margin: 6px 0 0;
    font-size: 13px;
    color: #94a3b8;
    font-weight: 500;
}

.login-form {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

/* 输入框基础样式 */
.input-group {
    display: flex;
    align-items: center;
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    border-radius: 16px;
    padding: 0 16px;
    transition: all 0.3s ease;
}

.input-group.is-focused {
    border-color: #3b82f6;
    background: #ffffff;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

/* 输入框错误状态样式 */
.input-group.has-error {
    border-color: #ef4444;
    background: #fef2f2;
}

.input-group.has-error.is-focused {
    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
}

.input-group.has-error .input-icon {
    color: #ef4444;
}

.input-icon {
    color: #94a3b8;
    display: flex;
    align-items: center;
    transition: 0.3s;
}

.input-group.is-focused:not(.has-error) .input-icon {
    color: #3b82f6;
}

.password-input {
    flex: 1;
    border: none;
    background: transparent;
    padding: 14px 12px;
    font-size: 15px;
    color: #1e293b;
    font-weight: 600;
    outline: none;
    letter-spacing: 2px;
}

.password-input::placeholder {
    font-weight: 500;
    color: #cbd5e1;
    letter-spacing: normal;
}

/* 错误提示文字与动画 */
.error-message {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #ef4444;
    font-size: 12px;
    font-weight: 600;
    margin-top: -12px;
    /* 向上拉近与输入框的距离 */
    margin-bottom: -4px;
    padding-left: 8px;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}

.btn-primary.login-btn {
    width: 100%;
    background: #3b82f6;
    color: white;
    border: none;
    padding: 14px;
    border-radius: 16px;
    font-size: 15px;
    font-weight: 700;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.btn-primary.login-btn:hover:not(:disabled) {
    background: #2563eb;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
}

.btn-primary.login-btn:active:not(:disabled) {
    transform: translateY(0);
}

.btn-primary.login-btn:disabled {
    background: #94a3b8;
    cursor: not-allowed;
    box-shadow: none;
}

.arrow-icon {
    transition: 0.3s;
}

.btn-primary.login-btn:hover:not(:disabled) .arrow-icon {
    transform: translateX(4px);
}

.spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    100% {
        transform: rotate(360deg);
    }
}

.login-footer {
    position: absolute;
    bottom: 24px;
    font-size: 12px;
    color: #94a3b8;
    font-weight: 500;
    z-index: 10;
}
</style>