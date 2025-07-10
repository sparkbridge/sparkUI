<template>
    <el-card class="rule-card">
        <template #header>
            <div class="card-header">
                <el-input v-model="localRule.name" placeholder="请输入规则名称" class="rule-name-input"></el-input>
                <el-button type="danger" link :icon="Delete" @click="$emit('delete')">删除规则</el-button>
            </div>
        </template>

        <div class="event-type-selector">
            <span class="event-label">触发器类型:</span>
            <el-select v-model="localRule.eventType" placeholder="选择事件类型">
                <el-option label="私聊消息" value="private_chat"></el-option>
                <el-option label="群聊消息" value="group_chat"></el-option>
                <el-option label="成员进群" value="group_join"></el-option>
                <el-option label="成员退群" value="group_leave"></el-option>
                <el-option label="定时任务" value="scheduled_task"></el-option>
            </el-select>
        </div>

        <div v-if="localRule.eventType === 'scheduled_task'" class="schedule-config">
            <el-form-item label="执行周期 (Cron 表达式)">
                <el-input v-model="localRule.schedule" placeholder="例如: 0 9 * * * (每天上午9点)"></el-input>
                <div class="form-help-text">
                    标准的5位Cron表达式，分别代表：分钟、小时、日、月、星期。
                    <el-link type="primary" href="https://crontab.guru/" target="_blank">不熟悉？点此查看帮助</el-link>
                </div>
            </el-form-item>
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
// script 部分无需改动，之前的设计已经足够灵活
import { ref, watch } from 'vue';
import { Delete, Right } from '@element-plus/icons-vue';
import ConditionList from './ConditionList.vue';
import ActionList from './ActionList.vue';

const props = defineProps({ modelValue: Object, variables: Array });
const emit = defineEmits(['update:modelValue', 'delete']);
const localRule = ref(props.modelValue);

watch(() => props.modelValue, (newValue) => { localRule.value = newValue; });
watch(localRule, (newValue) => { emit('update:modelValue', newValue); }, { deep: true });
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

.schedule-config {
    background-color: #f5f7fa;
    padding: 15px;
    border-radius: 4px;
    margin-bottom: 15px;
}

.form-help-text {
    font-size: 12px;
    color: #999;
    margin-top: 5px;
}

.form-help-text .el-link {
    font-size: 12px;
    margin-left: 5px;
    vertical-align: baseline;
}
</style>