<template>
    <div class="showcase-page">
        <el-card class="project-intro-card">
            <div class="project-header">
                <img src="https://sparkbridge.cn/spark.png" alt="Project Logo" class="project-logo" />
                <div class="project-title">
                    <h1>SparkBridge</h1>
                    <p class="tagline">一个现代、高效、可扩展的管理面板框架</p>
                </div>
            </div>

            <el-divider />

            <div class="feature-section">
                <h3>核心特性</h3>
                <ul>
                    <li>基于 Vue 3, Vite 和 Element Plus 构建</li>
                    <li>完全响应式设计，兼容桌面和移动设备</li>
                    <li>模块化、组件化的代码结构</li>
                    <li>动态、数据驱动的界面渲染</li>
                    <li>强大的虚拟聊天和日志展示功能</li>
                </ul>
            </div>

            <div class="action-buttons">
                <el-button type="primary" size="large" :icon="Promotion"
                    @click="goTo('https://github.com')">访问GitHub</el-button>
                <el-button size="large" :icon="Document" @click="goTo('https://element-plus.org')">查看文档</el-button>
            </div>
        </el-card>

        <SponsorList />
    </div>
</template>

<script setup>
import { Promotion, Document } from '@element-plus/icons-vue';
import SponsorList from '../components/SponsorList.vue';

const goTo = (url) => {
    window.open(url, '_blank');
};
</script>

<style scoped>
.showcase-page {
    max-width: 1000px;
    margin: 0 auto;
}

.project-intro-card {
    border-radius: 8px;
}

.project-header {
    display: flex;
    align-items: center;
}

.project-logo {
    width: 80px;
    height: 80px;
    margin-right: 20px;
}

.project-title h1 {
    margin: 0;
    font-size: 2.5em;
}

.tagline {
    margin: 5px 0 0;
    font-size: 1.1em;
    color: #888;
}

.feature-section {
    margin: 20px 0;
}

.feature-section h3 {
    margin-bottom: 15px;
}

.feature-section ul {
    list-style-type: none;
    padding: 0;
}

.feature-section li {
    margin-bottom: 10px;
    padding-left: 20px;
    position: relative;
}

.feature-section li::before {
    content: '✓';
    color: #67c23a;
    position: absolute;
    left: 0;
    font-weight: bold;
}

.action-buttons {
    margin-top: 30px;
    text-align: center;
}
</style>