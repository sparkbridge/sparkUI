<template>
    <div class="plugin-market-container">
        <div class="page-header">
            <h1>插件市场</h1>
            <el-input v-model="searchQuery" placeholder="搜索插件..." :prefix-icon="Search" clearable
                class="search-input" />
        </div>

        <el-row :gutter="20">
            <el-col :lg="6" :md="8" :sm="12" :xs="24" v-for="plugin in filteredPlugins" :key="plugin.id"
                class="plugin-col">
                <PluginCard :plugin="plugin" @download="handleDownload" />
            </el-col>
        </el-row>

        <el-empty v-if="filteredPlugins.length === 0" description="未找到匹配的插件"></el-empty>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getPlugins, downloadPlugin } from '../api';
import PluginCard from '../components/PluginCard.vue';
import { Search } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const allPlugins = ref([]);
const searchQuery = ref('');

const filteredPlugins = computed(() => {
    const query = searchQuery.value.toLowerCase();
    if (!query) {
        return allPlugins.value;
    }
    return allPlugins.value.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
    );
});

const handleDownload = async (plugin) => {
    ElMessage.info(`正在请求下载 ${plugin.name}...`);
    try {
        const response = await downloadPlugin(plugin.id);
        if (response.data.code === 0) {
            ElMessage.success(response.data.message);
        } else {
            ElMessage.error(response.data.message || '下载请求失败');
        }
    } catch (error) {
        ElMessage.error('下载接口请求出错');
    }
};

onMounted(async () => {
    const response = await getPlugins();
    allPlugins.value = response.data.data;
});
</script>

<style scoped>
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 15px;
}

.search-input {
    max-width: 300px;
}

.plugin-col {
    margin-bottom: 20px;
}
</style>