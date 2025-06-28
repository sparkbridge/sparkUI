<template>
    <div class="dashboard-container">
        <div class="dashboard-header">
            <h1>配置管理</h1>
            <el-button type="primary" @click="exportConfig" :loading="isSaving">导出为JSON</el-button>
        </div>

        <el-form label-position="top" class="dashboard-form" ref="formRef" :model="configData" :rules="formRules"
            v-if="configData">
            <el-row :gutter="20">
                <el-col :md="12" :sm="24" :xs="24" v-for="(category, categoryName) in configData" :key="categoryName"
                    style="margin-bottom: 20px;">
                    <el-card>
                        <template #header>
                            <div class="card-header"><span>{{ categoryName }}</span></div>
                        </template>
                        <div v-for="(item, key) in category" :key="key">
                            <el-form-item :label="item.desc" :prop="`${categoryName}.${key}.value`">

                                <div v-if="item.type === CONFIG_TYPE.EditArray"
                                    style="display: flex; align-items: center; width: 100%;">
                                    <el-input :model-value="item.value" placeholder="点击右侧按钮编辑数组" readonly>
                                        <template #append>
                                            <el-button @click="openArrayEditor(categoryName, key, item)" :icon="Edit" />
                                        </template>
                                    </el-input>
                                </div>

                                <el-switch v-else-if="item.type === CONFIG_TYPE.switch" v-model="item.value"
                                    @change="handleValueChange(categoryName, key, item)" />
                                <el-select v-else-if="item.type === CONFIG_TYPE.Choosing" v-model="item.value"
                                    @change="handleValueChange(categoryName, key, item)" placeholder="请选择"
                                    style="width: 100%;"><el-option v-for="(option, index) in item.options" :key="index"
                                        :label="option" :value="String(index)" /></el-select>
                                <el-input v-else-if="item.type === CONFIG_TYPE.text" v-model="item.value"
                                    @change="handleValueChange(categoryName, key, item)" :placeholder="item.desc" />
                                <el-input-number v-else-if="item.type === CONFIG_TYPE.number" v-model="item.value"
                                    @change="handleValueChange(categoryName, key, item)" :controls="false"
                                    style="width: 100%;" />
                                <el-button v-else-if="item.type === CONFIG_TYPE.buttom" type="primary" plain
                                    @click="handleAction(categoryName, key, item)">{{ item.desc }}</el-button>
                                <el-input v-else v-model="item.value"
                                    @change="handleValueChange(categoryName, key, item)"
                                    :placeholder="'未知类型: ' + item.type" />
                            </el-form-item>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
        </el-form>

        <!-- <el-dialog v-model="dialogVisible" :title="`编辑 - ${currentItemInfo?.item.desc}`" width="500px">
            <div v-for="(val, index) in tempArray" :key="index" style="margin-bottom: 10px;">
                <el-input v-model="tempArray[index]" placeholder="请输入内容">
                    <template #append>
                        <el-button @click="deleteItem(index)" type="danger" :icon="Delete" />
                    </template>
                </el-input>
            </div>
            <el-button @click="addItem" type="primary" plain :icon="Plus" style="width: 100%">新增一项</el-button>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="confirmEdit">确定</el-button>
                </span>
            </template>
        </el-dialog> -->
        <el-dialog v-model="dialogVisible" :title="`编辑 - ${currentItemInfo?.item.desc}`"
            :width="isMobile ? '90%' : '500px'">
            <div v-for="(val, index) in tempArray" :key="index" style="margin-bottom: 10px;">
                <el-input v-model="tempArray[index]" placeholder="请输入内容">
                    <template #append>
                        <el-button @click="deleteItem(index)" type="danger" :icon="Delete" />
                    </template>
                </el-input>
            </div>
            <el-button @click="addItem" type="primary" plain :icon="Plus" style="width: 100%">新增一项</el-button>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="confirmEdit">确定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive, watch } from 'vue';
import { useBreakpoints } from '@vueuse/core';
import { ElMessage } from 'element-plus';
import { Edit, Delete, Plus } from '@element-plus/icons-vue';
import { getGlobalConfig, updateSingleConfig, triggerButtonClickEvent } from '../api';


const breakpoints = useBreakpoints({ mobile: 768 });
const isMobile = breakpoints.smaller('mobile');

// --- 状态定义 ---
const CONFIG_TYPE = { EditArray: 1, switch: 2, Choosing: 3, text: 4, number: 5, buttom: 6 };
const loading = ref(false);
const isSaving = ref(false);
const configData = ref({});
const dialogVisible = ref(false);
const tempArray = ref([]);
const currentItemInfo = ref(null);
const formRef = ref(null);
const formRules = reactive({});

// --- 侦听器，动态生成校验规则 ---
watch(configData, (newConfig) => {
    Object.keys(formRules).forEach(key => delete formRules[key]);
    if (!newConfig) return;
    for (const categoryName in newConfig) {
        if (Object.hasOwnProperty.call(newConfig, categoryName)) {
            formRules[categoryName] = {};
            const category = newConfig[categoryName];
            for (const key in category) {
                if (Object.hasOwnProperty.call(category, key)) {
                    const item = category[key];
                    if (item.type === CONFIG_TYPE.number) {
                        formRules[categoryName][key] = {
                            value: [{ type: 'number', message: '该字段必须为数字值', trigger: 'blur' }]
                        };
                    }
                }
            }
        }
    }
}, { deep: true });

// --- 方法 ---

// 【恢复】打开数组编辑弹窗
const openArrayEditor = (categoryName, key, item) => {
    currentItemInfo.value = { categoryName, key, item };
    const currentVal = item.value ? String(item.value).split(',') : [];
    tempArray.value = [...currentVal];
    dialogVisible.value = true;
};

// 【恢复】在弹窗中新增一项
const addItem = () => {
    tempArray.value.push('');
};

// 【恢复】在弹窗中删除一项
const deleteItem = (index) => {
    tempArray.value.splice(index, 1);
};

// 【恢复】确认弹窗编辑
const confirmEdit = () => {
    const newValue = tempArray.value.filter(val => val !== null && val.trim() !== '').join(',');
    const { categoryName, key, item } = currentItemInfo.value;
    item.value = newValue;
    handleValueChange(categoryName, key, item);
    dialogVisible.value = false;
};

// 实时更新函数
const handleValueChange = async (pluginId, changeK, item) => {
    let finalValue = item.value;
    if (item.type === CONFIG_TYPE.Choosing) { finalValue = Number(item.value); }
    if (item.type === CONFIG_TYPE.EditArray) {
        // 数组元素可以是任意字符串，所以不再转换成数字
        finalValue = String(item.value).split(',').filter(i => i.trim());
    }
    const payload = { plugin_id: pluginId, changeK: changeK, value: finalValue };
    try {
        const response = await updateSingleConfig(payload);
        if (!(response.data && response.data.code === 0)) {
            ElMessage.error(response.data.message || '更新失败');
        }
    } catch (error) {
        ElMessage.error(error.response?.data?.message || '网络请求失败');
    }
};
  
// 【最终版】处理所有按钮的点击事件
const handleAction = async (categoryName, key, item) => {
    const payload = {
        plugin_name: categoryName,
        event_name: key,
    };

    try {
        ElMessage.info(`正在执行操作: ${item.desc}...`);
        // 1. 所有按钮点击都先调用API
        const response = await triggerButtonClickEvent(payload);
        const resData = response.data;

        if (!resData) {
            ElMessage.error('无效的后端响应');
            return;
        }

        // 2. 根据API返回的code，决定前端的后续动作
        switch (resData.status) {
            // code: 0 -> 普通成功提示
            case 0:
                ElMessage.success(resData.message || '操作成功！');
                break;

            // code: 200 -> 弹出HTML内容的对话框
            case 200:
                if (resData.message) {
                    ElMessageBox.alert(resData.message, item.desc, {
                        dangerouslyUseHTMLString: true,
                        confirmButtonText: '好的',
                    });
                }
                break;

            // code: 303 -> 跳转到指定URL
            case 303:
                if (resData.url) {
                    window.open(resData.url, '_blank');
                } else {
                    ElMessage.error('跳转失败：URL未在响应中提供。');
                }
                break;

            // 其他所有非0，非200，非303的code -> 统一作为错误弹窗处理
            default:
                ElMessageBox.alert(resData.message || '发生未知错误', '操作失败', {
                    confirmButtonText: '好的',
                    type: 'error',
                });
                break;
        }

    } catch (error) {
        // 网络层或服务器500错误
        console.error('按钮事件API调用失败:', error);
        const errorMessage = error.response?.data?.message || '操作执行失败';
        ElMessageBox.alert(errorMessage, '请求错误', {
            confirmButtonText: '好的',
            type: 'error',
        });
    }
};


// 导出配置函数
const exportConfig = () => {
    isSaving.value = true;
    try {
        const dataToExport = JSON.parse(JSON.stringify(configData.value));
        Object.values(dataToExport).forEach(category => {
            Object.values(category).forEach(item => {
                if (item.type === CONFIG_TYPE.EditArray && typeof item.value === 'string') {
                    item.value = item.value.split(',').filter(i => i.trim());
                }
                if (item.type === CONFIG_TYPE.Choosing) {
                    item.value = Number(item.value);
                }
            });
        });
        const jsonString = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'config.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        ElMessage.success('配置已成功导出！');
    } catch (error) {
        console.error('导出JSON失败:', error);
        ElMessage.error('导出失败，请查看控制台日志。');
    } finally {
        isSaving.value = false;
    }
};

// 组件挂载
onMounted(async () => {
    loading.value = true;
    try {
        const response = await getGlobalConfig();
        configData.value = response.data.data;
    } catch (error) {
        ElMessage.error('获取配置失败！');
    } finally {
        loading.value = false;
    }
});

</script>

<style scoped>
.dashboard-container {
    height: 100vh;
}

/* .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #dcdfe6;
}

.el-form-item {
    margin-bottom: 18px;
}
*/

.el-card {
    height: 100%;
} 

:deep(.el-input-number .el-input__inner) {
    text-align: left;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    background-color: #fff;
    padding: 0px 20px;
    border-radius: 4px;
}

/* .dashboard-form {
    background-color: #fff;
    padding: 20px;
    border-radius: 4px;
} */

.el-form-item {
    margin-bottom: 0px;
    /* 移除默认边距，由父div控制 */
}

/* 外层div负责边距，避免 el-form-item 的校验信息位置错误 */
div>div {
    margin-bottom: 18px;
}

div>.el-form-item {
    margin-bottom: 0px;
}

/* 数字输入框左对齐 */
:deep(.el-input-number .el-input__inner) {
    text-align: left;
}
</style>
```