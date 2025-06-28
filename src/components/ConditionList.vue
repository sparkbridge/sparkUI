<template>
    <div class="rule-section">
        <div class="rule-section-title if">IF</div>
        <span>当满足以下所有条件时:</span>
        <div v-for="(condition, condIndex) in localConditions" :key="condition.id" class="rule-item-row">
            <el-select v-model="condition.type" placeholder="条件类型" class="flex-item">
                <el-option label="消息内容" value="message_content"></el-option>
                <el-option label="用户ID" value="user_id"></el-option>
                <el-option label="群组ID" value="group_id"></el-option>
            </el-select>

            <el-select v-model="condition.operator" placeholder="操作符" class="flex-item"
                @change="onOperatorChange(condition)">
                <el-option label="等于" value="equals"></el-option>
                <el-option label="包含" value="contains"></el-option>
                <el-option label="正则匹配" value="matches_regex"></el-option>
                <el-option label="等于变量" value="equals_variable"></el-option>
            </el-select>

            <el-select v-if="condition.operator === 'equals_variable'" v-model="condition.value" placeholder="选择一个变量"
                class="flex-item-large">
                <el-option v-for="v in variables" :key="v.id" :label="v.key" :value="v.key"></el-option>
            </el-select>
            <el-input v-else v-model="condition.value" placeholder="值" class="flex-item-large"></el-input>

            <el-button type="danger" :icon="Delete" circle plain class="delete-btn"
                @click="deleteCondition(condIndex)"></el-button>
        </div>
        <el-button link type="primary" @click="addCondition">+ 添加条件</el-button>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Delete } from '@element-plus/icons-vue';
import { v4 as uuidv4 } from 'uuid';

// 【重要修改】接收从 RuleCard 传递过来的 variables 数组
const props = defineProps({ modelValue: Array, variables: Array });
const emit = defineEmits(['update:modelValue']);
const localConditions = ref(props.modelValue);

watch(() => props.modelValue, (newValue) => {
    localConditions.value = newValue;
});
watch(localConditions, (newValue) => {
    emit('update:modelValue', newValue);
}, { deep: true });

const addCondition = () => localConditions.value.push({ id: uuidv4(), type: 'message_content', operator: 'contains', value: '' });
const deleteCondition = (index) => localConditions.value.splice(index, 1);

// 【新增】当操作符切换时，清空“值”，防止数据混淆
const onOperatorChange = (condition) => {
    condition.value = '';
};
</script>


<style scoped>
/* 样式移至父组件或全局 */
.rule-section {
    flex: 1;
    border: 1px dashed #dcdfe6;
    border-radius: 4px;
    padding: 15px;
}

.rule-section-title {
    font-size: 1.5em;
    font-weight: bold;
    display: block;
    margin-bottom: 15px;
    text-align: center;
}

.rule-section-title.if {
    color: #409eff;
}

.rule-item-row {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
    align-items: center;
}

.rule-item-row .flex-item {
    flex: 1;
}

.rule-item-row .flex-item-large {
    flex: 2;
}

.rule-item-row .delete-btn {
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.2s ease;
}

.rule-item-row:hover .delete-btn {
    visibility: visible;
    opacity: 1;
}
</style>