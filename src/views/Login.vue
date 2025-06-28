<template>
    <div class="login-container">
        <el-card class="login-card">
            <template #header>
                <div class="card-header">
                    <span>系统登录</span>
                </div>
            </template>
            <el-form ref="loginFormRef" :model="loginForm" label-width="80px" label-position="right">
                <el-form-item label="用户ID">
                    <el-input v-model="loginForm.id" placeholder="请输入用户ID"></el-input>
                </el-form-item>
                <el-form-item label="密码">
                    <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" show-password
                        @keyup.enter="handleLogin"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleLogin" :loading="loading"
                        style="width: 100%;">登录</el-button>
                </el-form-item>
                <div class="bottom-link">
                    <el-link type="primary" @click="goToRegister">没有账户？立即注册</el-link>
                </div>
            </el-form>
        </el-card>
    </div>
</template>

<script setup>
// script 部分的代码无需改动
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { loginUser } from '../api';

const router = useRouter();
const loading = ref(false);
const loginForm = reactive({
    id: 'admin',
    password: 'password123',
});

const handleLogin = async () => {
    if (!loginForm.id || !loginForm.password) {
        ElMessage.error('用户ID和密码不能为空');
        return;
    }
    loading.value = true;
    try {
        const base64Password = btoa(loginForm.password);
        const loginResponse = await loginUser({
            id: loginForm.id,
            password: base64Password,
        });
        if (loginResponse.data.code === 0) {
            ElMessage.success('登录成功！');
            localStorage.setItem('user-token', loginResponse.data.data.token);
            router.push('/dashboard');
        } else {
            ElMessage.error(loginResponse.data.message || '登录失败');
        }
    } catch (error) {
        ElMessage.error(error.response?.data?.message || '登录请求失败');
    } finally {
        loading.value = false;
    }
};

const goToRegister = () => {
    router.push('/register');
};
</script>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f0f2f5;
    padding: 0 20px;
    /* 在屏幕两边留出一些边距 */
}

/* 【重要修改】
    1. 使用 width: 90% 让卡片宽度自适应屏幕。
    2. 使用 max-width: 450px 限制在PC端不要过宽。
    3. 添加 box-sizing: border-box 是一个好习惯。
  */
.login-card {
    width: 90%;
    max-width: 450px;
    box-sizing: border-box;
}

.bottom-link {
    text-align: center;
    margin-top: 10px;
}
</style>