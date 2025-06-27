<template>
    <div class="sponsor-list-container">
        <div class="sponsor-header">
            <div class="header-text">
                <h2>特别鸣谢</h2>
                <p>感谢以下赞助商对本项目的支持！</p>
            </div>
            <div class="header-action">
                <el-button type="warning" :icon="StarFilled" @click="handleSponsorClick">
                    成为金牌赞助商
                </el-button>
            </div>
        </div>

        <el-row :gutter="20">
            <el-col :lg="4" :md="6" :sm="8" :xs="12" v-for="sponsor in sponsors" :key="sponsor.id">
                <a :href="sponsor.websiteUrl" target="_blank" rel="noopener noreferrer">
                    <el-card class="sponsor-card" shadow="hover">
                        <el-image :src="sponsor.logoUrl" :alt="sponsor.name" fit="contain" class="sponsor-logo" />
                        <div class="sponsor-name">{{ sponsor.name }}</div>
                        <p class="sponsor-message" :title="sponsor.message">{{ sponsor.message }}</p>
                    </el-card>
                </a>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getSponsors } from '../api';
// 【新增】引入图标
import { StarFilled } from '@element-plus/icons-vue';

const sponsors = ref([]);

onMounted(async () => {
    try {
        const response = await getSponsors();
        if (response.data.code === 0) {
            sponsors.value = response.data.data;
        }
    } catch (error) {
        console.error('获取赞助商列表失败:', error);
    }
});

// 【新增】处理成为赞助商按钮的点击事件
const handleSponsorClick = () => {
    // 在新标签页中打开您的赞助页面链接
    // 请将下面的URL替换为您真实的赞助页面地址
    window.open('https://sparkbridge.cn/about/us.html', '_blank');
};
</script>

<style scoped>
.sponsor-list-container {
    margin-top: 30px;
}

/* 【新增】赞助商列表头部的样式 */
.sponsor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    /* 允许在小屏幕上换行 */
    margin-bottom: 30px;
    gap: 15px;
    /* 在换行时提供垂直间距 */
}

.header-text h2 {
    margin: 0;
}

.header-text p {
    margin: 5px 0 0;
    color: #888;
}

/* 原始样式保持不变 */
.sponsor-card {
    text-align: center;
    margin-bottom: 20px;
    transition: transform 0.2s ease-in-out;
    min-height: 180px;
}

.sponsor-card:hover {
    transform: translateY(-5px);
}

.sponsor-logo {
    height: 60px;
    width: 100%;
}

.sponsor-name {
    margin-top: 10px;
    font-size: 14px;
    font-weight: bold;
    color: #303133;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

a {
    text-decoration: none;
}

.sponsor-message {
    font-size: 12px;
    color: #909399;
    margin: 8px 0 0;
    padding: 0 5px;
    line-height: 1.5;
    height: 4.5em;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
}

/* 在手机端，让头部内容居中显示 */
@media (max-width: 768px) {
    .sponsor-header {
        justify-content: center;
        text-align: center;
    }
}
</style>