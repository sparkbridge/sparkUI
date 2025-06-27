<template>
    <el-container class="layout-container">
        <el-aside width="200px" v-if="!isMobile">
            <div class="sidebar-logo">
                <img src="https://sparkbridge.cn/spark.png" alt="logo" />
                <span>管理面板</span>
            </div>
            <MainMenu />
        </el-aside>

        <el-drawer v-model="drawerVisible" title="导航菜单" direction="ltr" :with-header="false" size="200px">
            <MainMenu @select="drawerVisible = false" />
        </el-drawer>

        <el-container>
            <el-header class="main-header">
                <div class="header-left">
                    <el-icon class="menu-button" @click="drawerVisible = true" v-if="isMobile">
                        <Menu />
                    </el-icon>
                    <CyclingSlogan />
                </div>
                <div class="header-right">
                    <el-button @click="handleLogout" type="danger" plain>退出登录</el-button>
                </div>
            </el-header>

            <div class="announcement-wrapper" v-if="announcement && announcement.necessary">
                <el-alert :title="announcement.title" :type="announcement.type || 'info'"
                    :description="announcement.content" :closable="announcement.closable"
                    @close="handleCloseAnnouncement" show-icon />
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
import { onMounted, ref,onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Menu } from '@element-plus/icons-vue';
import { useBreakpoints } from '@vueuse/core';
import MainMenu from './MainMenu.vue';
// 【新增】引入我们创建的标语组件
import CyclingSlogan from '../components/CyclingSlogan.vue';

// script 部分的代码无需改动
const router = useRouter();
const drawerVisible = ref(false);
const breakpoints = useBreakpoints({ mobile: 768 });
const isMobile = breakpoints.smaller('mobile');


// 【新增】获取当前年份
const currentYear = new Date().getFullYear();

// 【新增】引入新的API函数
import { getAnnouncement } from '../api';

// 【新增】用于存放公告数据的状态
const announcement = ref(null);

// 【新增】关闭公告栏的事件处理
const handleCloseAnnouncement = () => {
    // 将公告设置为空，v-if 指令就会将它从DOM中移除
    announcement.value = null;
    ElMessage.info('您已关闭此公告');
};

// 【新增】组件挂载时，调用API获取公告
onMounted(async () => {
    try {
        const response = await getAnnouncement();
        if (response.data.code === 0) {
            announcement.value = response.data.data;
        }
    } catch (error) {
        console.error('获取公告失败:', error);
    }
});

const handleLogout = () => {
    localStorage.removeItem('user-token');
    ElMessage.success('已成功退出登录！');
    router.push('/login');
};
</script>

<style scoped>
.layout-container {
    height: 100vh;
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

.main-header {
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

/* 【新增】页脚样式 */
.main-footer {
    height: 40px;
    /* 设置一个合适的高度 */
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #888;
    background-color: #f0f2f5;
    /* 与主内容区背景色一致或稍作区分 */
    border-top: 1px solid #e6e6e6;
    /* 可选：添加一个上边框 */
}
</style>