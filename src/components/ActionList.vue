<template>
    <div class="rule-section">
        <div class="rule-section-title then">THEN</div>
        <span>则执行以下操作:</span>
        <div v-for="(action, actIndex) in localActions" :key="action.id" class="rule-item-row">
            <el-select v-model="action.type" placeholder="动作类型" class="flex-item">
                <el-option label="回复文本" value="reply_text"></el-option>
                <el-option label="回复图片" value="reply_image"></el-option>
                <el-option label="设置变量" value="set_variable"></el-option>
                <el-option label="禁言用户" value="mute_user"></el-option>
            </el-select>

            <el-input v-if="action.type === 'reply_text'" v-model="action.value" placeholder="回复内容"
                class="flex-item-large"></el-input>
            <el-input v-if="action.type === 'reply_image'" v-model="action.value" placeholder="图片URL"
                class="flex-item-large"></el-input>
            <el-input-number v-if="action.type === 'mute_user'" v-model="action.value" :min="1" placeholder="分钟数"
                class="flex-item-large"></el-input-number>

            <template v-if="action.type === 'set_variable'">
                <el-select v-model="action.variableName" placeholder="选择变量" class="flex-item" filterable>
                    <el-option v-for="v in variables" :key="v.id" :label="v.key" :value="v.key"></el-option>
                </el-select>
                <el-input v-model="action.value" placeholder="设置的值" class="flex-item"></el-input>
            </template>

            <el-button type="danger" :icon="Delete" circle plain class="delete-btn"
                @click="deleteAction(actIndex)"></el-button>
        </div>
        <el-button link type="primary" @click="addAction">+ 添加动作</el-button>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Delete } from '@element-plus/icons-vue';
import { v4 as uuidv4 } from 'uuid';

const props = defineProps({ modelValue: Array, variables: Array });
const emit = defineEmits(['update:modelValue']);
const localActions = ref(props.modelValue);

// 【重要修复】侦听来自父组件的prop变化
watch(() => props.modelValue, (newValue) => {
    localActions.value = newValue;
});

// 侦听本地变化 (保持不变)
watch(localActions, (newValue) => {
    emit('update:modelValue', newValue);
}, { deep: true });

const addAction = () => localActions.value.push({ id: uuidv4(), type: 'reply_text', value: '' });
const deleteAction = (index) => localActions.value.splice(index, 1);
</script>

<style scoped>
/* 样式与 ConditionList 类似，可以复用或提取 */
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

.rule-section-title.then {
    color: #67c23a;
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