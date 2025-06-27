<template>
    <div class="login-container">
        <el-card class="login-card">
            <template #header>
                <div class="card-header"><span>系统登录</span></div>
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
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { loginUser } from '../api'; // 引入API

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
        // 【重要修改】使用浏览器内置的 btoa() 函数进行 Base64 编码
        const base64Password = btoa(loginForm.password);

        // 发送包含 base64 密码的数据
        const loginResponse = await loginUser({
            id: loginForm.id,
            password: base64Password,
        });

        if (loginResponse.data.status === 200) {
            ElMessage.success('登录成功！');
            localStorage.setItem('user-token','123')// loginResponse.data.data.token);
            // console.log('条件满足，即将执行跳转到 /dashboard');
            router.push('/dashboard');
        } else {
            ElMessage.error(loginResponse.data.message || '登录失败');
        }
    } catch (error) {
        console.error('登录流程出错:', error);
        ElMessage.error(error.response?.data?.message || error.message || '登录请求失败');
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
}

.login-card {
    width: 450px;
}

.bottom-link {
    text-align: center;
    margin-top: 10px;
}
</style>