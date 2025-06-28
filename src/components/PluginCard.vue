<template>
    <el-card class="plugin-card" shadow="hover">
        <el-image :src="plugin.imageUrl" :alt="plugin.name" fit="cover" class="plugin-image" />

        <div class="plugin-content">
            <div class="plugin-header">
                <h3 class="plugin-name">{{ plugin.name }}</h3>
                <div class="tags">
                    <el-tag v-for="tag in plugin.tags" :key="tag" :type="getTagType(tag)" size="small" effect="light">
                        {{ tag }}
                    </el-tag>
                </div>
            </div>

            <p class="plugin-description">{{ plugin.description }}</p>
        </div>

        <div class="plugin-footer">
            <el-button text bg :icon="Promotion" @click.stop="goTo(plugin.githubUrl)">GitHub</el-button>

            <el-button v-if="plugin.status === 'installed'" type="danger" plain :icon="Delete"
                @click.stop="$emit('uninstall', plugin)">
                卸载
            </el-button>
            <el-button v-else type="primary" :icon="Download" @click.stop="$emit('download', plugin)"
                :loading="isInstalling">
                {{ isInstalling ? '正在安装...' : '下载' }}
            </el-button>
        </div>
    </el-card>
</template>

<script setup>
import { Promotion, Download,Delete } from '@element-plus/icons-vue';

const props = defineProps({
    plugin: { type: Object, required: true },
    // 【新增】接收一个“正在安装”的布尔状态
    isInstalling: { type: Boolean, default: false },
});

const emit = defineEmits(['download', 'uninstall']);

const goTo = (url) => {
    window.open(url, '_blank');
};

const getTagType = (tag) => {
    if (tag === '热销') return 'danger';
    if (tag === '推荐') return 'success';
    return 'info';
};
</script>

<style scoped>
.plugin-card {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.plugin-card :deep(.el-card__body) {
    padding: 0;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}

.plugin-image {
    width: 100%;
    height: 120px;
}

.plugin-content {
    padding: 15px;
    flex-grow: 1;
}

.plugin-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
}

.plugin-name {
    margin: 0;
    font-size: 1.1em;
}

.tags {
    display: flex;
    gap: 5px;
    flex-shrink: 0;
}

.plugin-description {
    font-size: 14px;
    color: #888;
    margin: 10px 0 0;
    line-height: 1.5;
}

.plugin-footer {
    padding: 10px 15px;
    border-top: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>