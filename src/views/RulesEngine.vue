<template>
    <div class="rules-engine-page">
        <div class="page-header">
            <h1>规则引擎</h1>
            <p class="page-description">通过创建IF/THEN规则，自动化处理各种事件。</p>
        </div>

        <div class="section-wrapper">
            <VariableManager v-model="customVariables" />
        </div>

        <div class="section-wrapper">
            <div class="rules-header">
                <h3>规则列表</h3>
                <el-button type="primary" :icon="Plus" @click="addRule">新建规则</el-button>
            </div>

            <div class="rules-list">
                <RuleCard v-for="(rule, index) in rules" :key="rule.id" v-model="rules[index]"
                    :variables="customVariables" @delete="deleteRule(index)" />
                <el-empty v-if="!rules.length" description="暂无规则，请新建"></el-empty>
            </div>
        </div>

        <transition name="slide-up">
            <div v-if="isDirty" class="floating-save-bar">
                <span>您有未保存的更改</span>
                <div>
                    <el-button @click="discardChanges">放弃更改</el-button>
                    <el-button type="primary" :icon="Check" @click="saveAll">保存所有变更</el-button>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { Plus, Check } from '@element-plus/icons-vue';
import {  saveRules, getRulesEngineData, saveVariables } from '../api';
import { ElMessage } from 'element-plus';
import { v4 as uuidv4 } from 'uuid';
// 引入新创建的子组件
import VariableManager from '../components/VariableManager.vue';
import RuleCard from '../components/RuleCard.vue';

const customVariables = ref([]);
const rules = ref([]);
let originalState = '';
const isDirty = ref(false);

watch([customVariables, rules], (newValue) => {
    const currentState = JSON.stringify(newValue);
    isDirty.value = currentState !== originalState;
}, { deep: true });

const addRule = () => {
    rules.value.unshift({
        id: uuidv4(),
        name: '新规则',
        eventType: 'group_chat', // 默认事件类型
        conditions: [],
        actions: []
    });
};
const deleteRule = (index) => rules.value.splice(index, 1);

const saveAll = async () => {
    try {
        await Promise.all([saveRules(rules.value), saveVariables(customVariables.value)]);
        ElMessage.success('所有变更已成功保存！');

        // 【重要修改】保存成功后，用当前状态更新“初始状态”快照
        originalState = JSON.stringify([customVariables.value, rules.value]);
        // isDirty 会因为状态一致而自动变为 false
    } catch (error) {
        ElMessage.error('保存失败');
    }
};
// 【重要修改】重写 discardChanges 函数
const discardChanges = () => {
    try {
        // 1. 从原始状态字符串中解析出纯净的数据
        const [originalVars, originalRules] = JSON.parse(originalState);

        // 2. 用原始数据直接覆盖当前的响应式数据
        customVariables.value = originalVars;
        rules.value = originalRules;

        // 3. 给出提示
        ElMessage.info('已放弃所有未保存的更改。');

        // 4. Vue的watch会自动检测到数据已恢复一致，并将 isDirty 设为 false，从而隐藏状态栏。
    } catch (error) {
        ElMessage.error('恢复数据时出错，建议刷新页面。');
        console.error('Failed to parse originalState or revert changes:', error);
    }
};

// 【重要修改】重写 fetchData 函数以调用新的统一API
const fetchData = async () => {
    try {
        const response = await getRulesEngineData();
        if (response.data.code === 0) {
            const { rules: newRules, variables: newVars } = response.data.data;

            // 1. 先用从API获取的完整数据，创建“初始状态”的快照
            originalState = JSON.stringify([newVars, newRules]);

            // 2. 然后再将这些数据分别赋值给响应式变量
            customVariables.value = newVars;
            rules.value = newRules;
        } else {
            ElMessage.error(response.data.message || '获取数据失败');
        }
    } catch (error) {
        ElMessage.error('请求规则引擎数据时出错');
    }
};

onMounted(fetchData);
</script>

<style scoped>
.page-header {
    margin-bottom: 20px;
}

.page-header h1 {
    margin: 0;
}

.page-description {
    color: #888;
    margin-top: 5px;
}

.section-wrapper {
    margin-bottom: 20px;
}

.rules-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

/* 悬浮保存栏样式 */
.floating-save-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #fff;
    padding: 15px 30px;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 100;
}

.floating-save-bar span {
    font-size: 16px;
}

.slide-up-enter-active,
.slide-up-leave-active {
    transition: transform 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
    transform: translateY(100%);
}
</style>