<template>
    <div class="log-page-container">
      <div class="page-header">
        <h1>系统日志</h1>
        <div class="controls">
          <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="选择日志日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :disabled-date="disabledDate"
            @change="handleDateChange"
            style="margin-right: 15px;"
          />
          <el-radio-group v-model="filterLevel" size="small">
            <el-radio-button label="All">全部</el-radio-button>
            <el-radio-button label="info">信息</el-radio-button>
            <el-radio-button label="warn">警告</el-radio-button>
            <el-radio-button label="error">错误</el-radio-button>
          </el-radio-group>
        </div>
      </div>
  
      <div v-loading="loading">
        <el-table :data="filteredLogs" stripe style="width: 100%" v-if="!isMobile">
          <el-table-column prop="timestamp" label="时间" width="200"></el-table-column>
          <el-table-column prop="module" label="模块" width="150">
             <template #default="{ row }">
                <span class="module-text">{{ row.module }}</span>
             </template>
          </el-table-column>
          <el-table-column prop="level" label="级别" width="120">
            <template #default="{ row }">
              <el-tag :type="getTagType(row.level)">{{ row.level }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="message" label="信息"></el-table-column>
        </el-table>
  
        <div v-else class="mobile-log-list">
          <el-card v-for="(log, index) in filteredLogs" :key="index" class="log-card">
            <div class="log-item"><span class="log-label">时间:</span><span>{{ log.timestamp }}</span></div>
            <div class="log-item"><span class="log-label">模块:</span><span class="module-text">{{ log.module }}</span></div>
            <div class="log-item"><span class="log-label">级别:</span><el-tag :type="getTagType(log.level)" size="small">{{ log.level }}</el-tag></div>
            <div class="log-item message"><span class="log-label">信息:</span><p>{{ log.message }}</p></div>
          </el-card>
        </div>
  
        <el-empty v-if="logContent.length > 0 && filteredLogs.length === 0" description="当前级别下无日志"></el-empty>
        <el-empty v-if="logContent.length === 0 && !loading" description="暂无日志内容"></el-empty>
      </div>
    </div>
  </template>
  

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useBreakpoints } from '@vueuse/core';
import { ElMessage } from 'element-plus';
import { getLogDates, getLogContent } from '../api';

const breakpoints = useBreakpoints({ mobile: 768 });
const isMobile = breakpoints.smaller('mobile');

const loading = ref(false);
const availableDates = ref([]);
const selectedDate = ref(null);
const logContent = ref([]); // 存储结构化日志对象数组: [{timestamp, level, message}]
const filterLevel = ref('All');

// 【移除】不再需要 displayMode 状态
// const displayMode = ref('structured');

const disabledDate = (time) => {
    const date = new Date(time);
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return !availableDates.value.includes(dateString);
};

const getTagType = (level) => {
    switch (level) {
        case 'info': return 'success';
        case 'warn': return 'warning';
        case 'error': return 'danger';
        default: return 'info';
    }
};

const handleDateChange = async (date) => {
    if (!date) { logContent.value = []; return; }
    loading.value = true;
    try {
        const response = await getLogContent(date);
        logContent.value = response.data.data;
    } catch (error) {
        ElMessage.error(error.message || '获取日志内容失败');
        logContent.value = [];
    } finally {
        loading.value = false;
    }
};

// 筛选逻辑保持不变，它天生就适用于结构化数据
const filteredLogs = computed(() => {
    if (filterLevel.value === 'All') {
        return logContent.value;
    }
    return logContent.value.filter(log => log.level === filterLevel.value);
});


onMounted(async () => {
    try {
        const response = await getLogDates();
        if (response.data.code === 0 && response.data.data.length > 0) {
            availableDates.value = response.data.data;
            selectedDate.value = availableDates.value[0];
            await handleDateChange(selectedDate.value);
        } else {
            ElMessage.info('没有可用的日志文件');
        }
    } catch (error) {
        ElMessage.error('获取日志日期列表失败');
    }
});
</script>

<style scoped>
/* 页面主容器样式 */
.log-page-container {
    padding: 20px;
    background-color: #fff;
    border-radius: 4px;
}

/* 页面头部，包含标题和操作控件 */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 20px;
}

.page-header h1 {
    margin: 0 20px 10px 0;
}

/* 操作控件区域的容器 */
.controls {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 15px;
}
/* 【新增】为模块文本添加一点样式 */
.module-text {
    font-weight: bold;
    color: #303133;
}

/* --- 移动端下的卡片列表样式 --- */

.mobile-log-list .log-card {
    margin-bottom: 15px;
}

.mobile-log-list .log-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 8px;
    font-size: 14px;
}

.mobile-log-list .log-item.message {
    flex-direction: column;
    align-items: flex-start;
}

.mobile-log-list .log-label {
    font-weight: bold;
    margin-right: 8px;
    white-space: nowrap;
}

.mobile-log-list .log-item p {
    margin: 0;
    word-break: break-all;
}
</style>