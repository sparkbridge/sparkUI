<template>
    <div class="slogan-container">
        <Transition name="fade-up" mode="out-in">
            <span :key="sloganIndex" :title="currentSlogan">{{ currentSlogan }}</span>
        </Transition>
    </div>
</template>

<script setup>
// script 部分无需任何改动
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useDateFormat, useTimestamp } from '@vueuse/core';
import { getSlogans } from '../api';

// 【修改】slogans现在是一个空的ref，等待API填充
const slogans = ref([]);
const sloganIndex = ref(0);


let intervalTimer = null;
// 计算属性保持不变，但现在依赖于一个异步填充的ref

// 时间相关的逻辑保持不变
const formattedTime = useDateFormat(useTimestamp({ interval: 1000 }), 'YYYY/MM/DD HH:mm:ss');


const currentSlogan = computed(() => {
    // 添加一个保护，防止在slogans为空时访问出错
    if (slogans.value.length === 0) {
        return '正在加载...';
    }
    const sloganTemplate = slogans.value[sloganIndex.value];
    return sloganTemplate.replace('{time}', formattedTime.value);
});

// 【修改】onMounted现在是异步的，用于获取数据并启动定时器
onMounted(async () => {
    try {
        const response = await getSlogans();
        if (response.data.code === 0 && response.data.data.length > 0) {
            slogans.value = response.data.data;

            // 在成功获取到数据之后，再启动切换标语的定时器
            intervalTimer = setInterval(() => {
                sloganIndex.value = (sloganIndex.value + 1) % slogans.value.length;
            }, 5000);
        } else {
            // 如果API返回空数组或错误，给一个默认的标语
            slogans.value = ['欢迎使用'];
            ElMessage.error(response.data.message || '获取标语失败');
        }
    } catch (error) {
        slogans.value = ['欢迎使用'];
        ElMessage.error('请求标语接口时出错');
        console.error(error);
    }
});



onUnmounted(() => {
    clearInterval(intervalTimer);
});
</script>

<style scoped>
/* 样式部分无需任何改动 */
.slogan-container {
    position: relative;
    height: 24px;
    width: 400px;
    line-height: 24px;
}

.slogan-container span {
    position: absolute;
    width: 100%;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.fade-up-enter-active,
.fade-up-leave-active {
    transition: all 0.5s ease;
}

.fade-up-enter-from {
    opacity: 0;
    transform: translateY(20px);
}

.fade-up-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}
</style>