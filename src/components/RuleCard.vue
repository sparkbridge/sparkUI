<template>
    <el-card class="rule-card">
        <template #header>
            <div class="card-header">
                <el-input v-model="localRule.name" placeholder="请输入规则名称" class="rule-name-input"></el-input>
                <el-button type="danger" link :icon="Delete" @click="$emit('delete')">删除规则</el-button>
            </div>
        </template>

        <div class="event-type-selector">
            <span class="event-label">当事件发生:</span>
            <el-select v-model="localRule.eventType" placeholder="选择事件类型">
                <el-option label="私聊消息" value="private_chat"></el-option>
                <el-option label="群聊消息" value="group_chat"></el-option>
                <el-option label="成员进群" value="group_join"></el-option>
                <el-option label="成员退群" value="group_leave"></el-option>
            </el-select>
        </div>

        <div class="rule-flow">
            <ConditionList v-model="localRule.conditions" :variables="variables" />

            <div class="arrow-separator"><el-icon>
                    <Right />
                </el-icon></div>

            <ActionList v-model="localRule.actions" :variables="variables" />
        </div>
    </el-card>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Delete, Right } from '@element-plus/icons-vue';
import ConditionList from './ConditionList.vue';
import ActionList from './ActionList.vue';

const props = defineProps({ modelValue: Object, variables: Array });
const emit = defineEmits(['update:modelValue', 'delete']);
const localRule = ref(props.modelValue);

// 【重要修复】侦听来自父组件的prop变化
watch(() => props.modelValue, (newValue) => {
    localRule.value = newValue;
});

// 侦听本地变化 (保持不变)
watch(localRule, (newValue) => {
    emit('update:modelValue', newValue);
}, { deep: true });
</script>

<style scoped>
.rule-card {
    margin-bottom: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.rule-name-input {
    border: none;
    font-size: 1.1em;
    font-weight: bold;
}

.rule-name-input:deep(.el-input__wrapper) {
    box-shadow: none;
    padding-left: 0;
}

.event-type-selector {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
}

.event-label {
    font-weight: bold;
}

.rule-flow {
    display: flex;
    align-items: stretch;
    gap: 15px;
}

.arrow-separator {
    display: flex;
    align-items: center;
    font-size: 24px;
    color: #c0c4cc;
}

@media (max-width: 992px) {
    .rule-flow {
        flex-direction: column;
    }

    .arrow-separator {
        transform: rotate(90deg);
        margin: 10px 0;
    }
}
</style>