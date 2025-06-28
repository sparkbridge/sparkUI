<template>
    <el-card>
        <template #header>
            <div class="card-header">
                <span>自定义变量</span>
                <el-button text type="primary" :icon="Plus" @click="addVariable">添加变量</el-button>
            </div>
        </template>
        <div v-for="(variable, index) in localVariables" :key="variable.id" class="variable-row">
            <el-input v-model="variable.key" placeholder="变量名"></el-input>
            <el-input v-model="variable.value" placeholder="变量值"></el-input>
            <el-button type="danger" :icon="Delete" circle plain @click="deleteVariable(index)"></el-button>
        </div>
        <el-empty v-if="!localVariables.length" description="暂无变量"></el-empty>
    </el-card>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Plus, Delete } from '@element-plus/icons-vue';
import { v4 as uuidv4 } from 'uuid';

const props = defineProps({ modelValue: Array });
const emit = defineEmits(['update:modelValue']);

// 使用 props.modelValue 初始化
const localVariables = ref(props.modelValue);

// 【重要修复】侦听来自父组件的prop变化，并更新本地状态
watch(() => props.modelValue, (newValue) => {
    localVariables.value = newValue;
});

// 侦听本地状态的变化，并通知父组件 (这部分保持不变)
watch(localVariables, (newValue) => {
    emit('update:modelValue', newValue);
}, { deep: true });

const addVariable = () => localVariables.value.push({ id: uuidv4(), key: '', value: '' });
const deleteVariable = (index) => localVariables.value.splice(index, 1);
</script>
<style scoped>
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.variable-row {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
}
</style>