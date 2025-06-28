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
                <PluginCard :plugin="plugin" :is-installing="installingPlugins.has(plugin.id)"
                    @download="handleDownload" @uninstall="handleUninstall" />
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { getPlugins, downloadPlugin } from '../api';
import PluginCard from '../components/PluginCard.vue';
import { Search } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const allPlugins = ref([]);
const searchQuery = ref('');

// 【新增】用一个 Set 来存储正在安装的插件ID，查询效率高
const installingPlugins = ref(new Set());
// 【新增】存储所有轮询定时器的引用，方便在页面卸载时清除
const pollingTimers = new Map();


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


// 轮询函数
const pollStatus = (plugin) => {
    const timer = setInterval(async () => {
        try {
            const response = await getPluginStatus(plugin.id);
            if (response.data.data.status === 'installed') {
                // 安装完成
                ElMessage.success(`插件 [${plugin.name}] 安装成功！`);
                // 1. 停止轮询
                clearInterval(pollingTimers.get(plugin.id));
                pollingTimers.delete(plugin.id);
                // 2. 更新插件列表中的状态
                const targetPlugin = allPlugins.value.find(p => p.id === plugin.id);
                if (targetPlugin) targetPlugin.status = 'installed';
                // 3. 从“正在安装”列表中移除
                installingPlugins.value.delete(plugin.id);
            }
        } catch {
            // 轮询出错，停止轮询
            ElMessage.error(`查询 [${plugin.name}] 状态失败，已停止轮询。`);
            clearInterval(pollingTimers.get(plugin.id));
            pollingTimers.delete(plugin.id);
            installingPlugins.value.delete(plugin.id);
        }
    }, 2000); // 每2秒查询一次

    pollingTimers.set(plugin.id, timer);
};

// 下载处理函数
const handleDownload = async (plugin) => {
    if (installingPlugins.value.has(plugin.id)) return;

    ElMessage.info(`开始安装 ${plugin.name}...`);
    installingPlugins.value.add(plugin.id);

    try {
        await downloadPlugin(plugin.id);
        // 初始请求成功后，开始轮询
        pollStatus(plugin);
    } catch (error) {
        ElMessage.error('启动安装任务失败！');
        installingPlugins.value.delete(plugin.id);
    }
};

// 卸载处理函数
const handleUninstall = async (plugin) => {
    try {
        await uninstallPlugin(plugin.id);
        const targetPlugin = allPlugins.value.find(p => p.id === plugin.id);
        if (targetPlugin) targetPlugin.status = 'not_installed';
        ElMessage.success(`插件 [${plugin.name}] 卸载成功！`);
    } catch (error) {
        ElMessage.error('卸载失败');
    }
};

// 组件卸载时，清除所有正在运行的定时器，防止内存泄漏
onUnmounted(() => {
    pollingTimers.forEach(timer => clearInterval(timer));
});

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