<template>
    <div class="not-found-container">
        <el-result icon="error" title="404 - 页面未找到" sub-title="抱歉，您访问的页面不存在或已被移除。">
            <template #extra>
                <el-button type="primary" @click="goHome">返回首页</el-button>
            </template>
        </el-result>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
    // 跳转回应用的根路径，导航守卫会自动判断应该去登录页还是仪表盘
    router.push('/');
};
</script>

<style scoped>
.not-found-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100%;
    background-color: #f5f7fa;
}
</style>