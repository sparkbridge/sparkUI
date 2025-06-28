<template>
    <div class="register-container">
        <el-card class="register-card">
            <template #header>
                <div class="card-header">
                    <span>新用户注册</span>
                </div>
            </template>
            <el-form @submit.prevent="handleRegister" label-width="80px" label-position="right">
                <el-form-item label="用户名">
                    <el-input v-model="username" placeholder="请输入用户名"></el-input>
                </el-form-item>
                <el-form-item label="密码">
                    <el-input v-model="password" type="password" placeholder="请输入密码"></el-input>
                </el-form-item>
                <el-form-item label="确认密码">
                    <el-input v-model="confirmPassword" type="password" placeholder="请再次输入密码"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleRegister" style="width: 100%;">注册</el-button>
                </el-form-item>
                <div class="bottom-link">
                    <el-link type="primary" @click="goToLogin">已有账户？立即登录</el-link>
                </div>
            </el-form>
        </el-card>
    </div>
</template>

<script setup>
// script 部分的代码无需改动
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const router = useRouter();
const username = ref('');
const password = ref('');
const confirmPassword = ref('');

const handleRegister = () => {
    if (!username.value || !password.value) {
        ElMessage.error('用户名和密码不能为空！');
        return;
    }
    if (password.value !== confirmPassword.value) {
        ElMessage.error('两次输入的密码不一致！');
        return;
    }
    console.log(`注册用户: ${username.value}`);
    ElMessage.success('注册成功！正在跳转到登录页面...');

    setTimeout(() => {
        router.push('/login');
    }, 1500);
};

const goToLogin = () => {
    router.push('/login');
};
</script>

<style scoped>
.register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f0f2f5;
    padding: 0 20px;
}

/* 【重要修改】应用与登录页相同的响应式样式 */
.register-card {
    width: 90%;
    max-width: 450px;
    box-sizing: border-box;
}

.bottom-link {
    text-align: center;
    margin-top: 10px;
}
</style>