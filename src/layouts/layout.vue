<template>
    <el-container class="layout-container">
        <el-aside width="200px" v-if="!isMobile">
            <div class="sidebar-logo">
                <img src="https://sparkbridge.cn/spark.png" alt="logo" />
                <span>管理面板</span>
            </div>
            <MainMenu :is-mobile="isMobile" @logout="handleLogout" />
        </el-aside>

        <el-drawer v-model="drawerVisible" direction="ltr" :with-header="false" size="200px">
            <MainMenu :is-mobile="isMobile" @select="drawerVisible = false" @logout="handleLogout" />
        </el-drawer>

        <el-container class="main-panel-container">
            <el-header class="main-header">
                <div class="header-left">
                    <el-icon class="menu-button" @click="drawerVisible = true" v-if="isMobile">
                        <Menu />
                    </el-icon>
                    <CyclingSlogan />
                </div>
                <div class="header-right">
                    <el-button v-if="!isMobile" @click="handleLogout" type="danger" plain>退出登录</el-button>
                </div>
            </el-header>

            <div class="announcement-wrapper" v-if="announcement">
                <el-alert :title="announcement.title" :type="announcement.type || 'info'"
                    :description="announcement.content" :closable="announcement.closable"
                    @close="handleCloseAnnouncement" show-icon v-if="announcement.nesscary" />
            </div>

            <el-main class="main-content">
                <router-view />
            </el-main>
            <el-footer class="main-footer">
                Copyright © {{ currentYear }} SparkBridge. All Rights Reserved.
            </el-footer>
        </el-container>
    </el-container>
</template>

<script setup>
// script 部分除了引入 MainMenu 的方式外，其他逻辑不变
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Menu } from '@element-plus/icons-vue';
import { useBreakpoints } from '@vueuse/core';
import { getAnnouncement } from '../api';
import MainMenu from './MainMenu.vue'; // MainMenu 是一个独立的组件
import CyclingSlogan from '../components/CyclingSlogan.vue';

const announcement = ref(null);
const currentYear = new Date().getFullYear();
const router = useRouter();
const drawerVisible = ref(false);
const breakpoints = useBreakpoints({ mobile: 768 });
const isMobile = breakpoints.smaller('mobile');

// handleLogout 函数现在被父组件持有，并传递给子组件使用
const handleLogout = () => {
    // 如果在抽屉中点击，先关闭抽屉
    if (drawerVisible.value) {
        drawerVisible.value = false;
    }
    localStorage.removeItem('user-token');
    ElMessage.success('已成功退出登录！');
    router.push('/login');
};

const handleCloseAnnouncement = () => {
    announcement.value = null;
    ElMessage.info('您已关闭此公告');
};

onMounted(async () => {
    try {
        const response = await getAnnouncement();
        console.log('获取公告成功:', response.data);
        if (response.data.code === 0) {
            announcement.value = response.data.data;
        }
    } catch (error) {
        console.error('获取公告失败:', error);
    }
});
</script>
  

<style scoped>
.layout-container {
    height: 100vh;
    /* 【新增】防止最外层容器自己产生滚动条 */
    overflow: hidden;
}

/* 【重要修改】
  对右侧的主面板容器（包含header, main, footer）应用flex布局
*/
.main-panel-container {
    display: flex;
    flex-direction: column;
    /* 设置主轴为垂直方向 */
    height: 100%;
    /* 确保它撑满父容器的高度 */
}

/* 【重要修改】将侧边栏的背景色与菜单的背景色统一 */
.el-aside {
    background-color: #2c3e50;
    color: #fff;
    transition: width 0.3s;
}

.sidebar-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 15px 0;
    font-size: 18px;
    font-weight: bold;
}

.sidebar-logo img {
    width: 32px;
    height: 32px;
    margin-right: 10px;
}

.announcement-wrapper {
    /* 【新增】设置公告栏不收缩 */
    flex-shrink: 0;
    /* 其他样式保持不变 */
    padding: 15px 20px 0 20px;
    background-color: #f0f2f5;
}

.main-header {
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e6e6e6;
}

.header-left {
    display: flex;
    align-items: center;
}

.menu-button {
    font-size: 24px;
    cursor: pointer;
    margin-right: 15px;
}

.main-content {
    /* 【修改】
        flex: 1; -> 让主内容区占据所有剩余的垂直空间
        overflow-y: auto; -> 当内容超出其高度时，只在主内容区内部出现垂直滚动条
      */
        flex: 1;
        overflow-y: auto;
        background-color: #f0f2f5;
        padding: 20px;
}

/* 抽屉样式保持不变 */
:global(.el-drawer__body) {
    padding: 0;
}

:global(.el-drawer__body .el-menu) {
    height: 100%;
}

/* --- 页脚样式 --- */
.main-footer {
    /* 【新增】设置footer不收缩 */
    flex-shrink: 0;
    /* 其他样式保持不变 */
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #888;
    background-color: #f0f2f5;
    border-top: 1px solid #e6e6e6;
}
</style>