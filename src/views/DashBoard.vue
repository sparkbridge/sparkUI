<template>
    <div class="dashboard-container">
        <el-container>
            <el-header class="header">
                <h1>配置管理面板</h1>
                <div>
                    <!-- <el-button @click="handleLogout" type="danger">退出登录</el-button> -->
                    <el-button type="primary" @click="saveConfig" :loading="isSaving" style="margin-left: 12px;">
                        导出为JSON
                    </el-button>
                </div>
            </el-header>

            <el-main v-loading="loading">
                <el-form label-position="top" v-if="configData">
                    <el-row :gutter="20">
                        <el-col :md="12" :sm="24" :xs="24" v-for="(category, categoryName) in configData"
                            :key="categoryName" style="margin-bottom: 20px;">
                            <el-card>
                                <template #header>
                                    <div class="card-header"><span>{{ categoryName }}</span></div>
                                </template>
                                <el-form-item v-for="(item, key) in category" :key="key" :label="item.desc">

                                    <div v-if="item.type === CONFIG_TYPE.EditArray"
                                        style="display: flex; align-items: center; width: 100%;">
                                        <el-input :model-value="item.value" :placeholder="item.desc" readonly>
                                            <template #append>
                                                <el-button @click="openArrayEditor(categoryName, key, item)"
                                                    :icon="Edit" />
                                            </template>
                                        </el-input>
                                    </div>

                                    <el-switch v-else-if="item.type === CONFIG_TYPE.switch" v-model="item.value"
                                        @change="handleValueChange(categoryName, key, item)" />
                                    <el-select v-else-if="item.type === CONFIG_TYPE.Choosing" v-model="item.value"
                                        @change="handleValueChange(categoryName, key, item)" placeholder="请选择"
                                        style="width: 100%;">
                                        <el-option v-for="(option, index) in item.options" :key="index" :label="option"
                                            :value="String(index)" />
                                    </el-select>
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
                            </el-card>
                        </el-col>
                    </el-row>
                </el-form>
            </el-main>
        </el-container>

        <el-dialog v-model="dialogVisible" :title="`编辑 - ${currentItemInfo?.item.desc}`" width="500px">
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getGlobalConfig, updateSingleConfig, triggerButtonClickEvent } from '../api';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Edit, Delete, Plus } from '@element-plus/icons-vue';

// 在 src/views/Dashboard.vue 的 <script setup> 中
import { useBreakpoints } from '@vueuse/core';

// 创建断点
const breakpoints = useBreakpoints({
    mobile: 768,
});
const isMobile = breakpoints.smaller('mobile');

// 定义配置类型常量
const CONFIG_TYPE = {
    EditArray: 1,
    switch: 2,
    Choosing: 3,
    text: 4,
    number: 5,
    buttom: 6,
};

const router = useRouter();
const loading = ref(true);
const isSaving = ref(false);
const configData = ref(null);

// 【新增】对话框相关状态
const dialogVisible = ref(false); // 控制对话框显示/隐藏
const tempArray = ref([]); // 在对话框中临时编辑的数组
const currentItemInfo = ref(null); // 存储当前正在编辑的项的信息

// 组件挂载时获取初始配置数据
onMounted(async () => {
    try {
        const response = await getGlobalConfig();
        const rawData = response.data.data;
        Object.values(rawData).forEach(category => {
            Object.values(category).forEach(item => {
                if (item.type === CONFIG_TYPE.EditArray && Array.isArray(item.value)) {
                    item.value = item.value.join(',');
                }
                if (item.type === CONFIG_TYPE.Choosing) {
                    item.value = String(item.value);
                }
            });
        });
        configData.value = rawData;
    } catch (error) {
        ElMessage.error('获取配置失败！');
        console.error(error);
    } finally {
        loading.value = false;
    }
});

const openArrayEditor = (categoryName, key, item) => {
    // 1. 存储当前操作项的信息，方便后续保存
    currentItemInfo.value = { categoryName, key, item };

    // 2. 将当前配置的字符串值，转换为数组，存入临时变量
    //    如果原值为空字符串，则初始化为空数组
    const currentVal = item.value ? String(item.value).split(',') : [];
    tempArray.value = [...currentVal]; // 使用扩展运算符进行浅拷贝

    // 3. 打开对话框
    dialogVisible.value = true;
};

// 【新增】在对话框中新增一项
const addItem = () => {
    tempArray.value.push(''); // 添加一个空字符串，界面上会出现一个新的空输入框
};

// 【新增】在对话框中删除一项
const deleteItem = (index) => {
    tempArray.value.splice(index, 1);
};

// 【新增】用户点击“确定”按钮，保存对话框的修改
const confirmEdit = () => {
    // 1. 从临时数组生成新的字符串值
    const newValue = tempArray.value.filter(val => val !== null && val.trim() !== '').join(',');

    // 2. 获取当前编辑项的信息
    const { categoryName, key, item } = currentItemInfo.value;

    // 3. 更新主配置对象中的值
    item.value = newValue;

    // 4. 调用通用的实时更新函数，将变更发送到后端
    handleValueChange(categoryName, key, item);

    // 5. 关闭对话框
    dialogVisible.value = false;
};

// 【重要修改】处理表单项值的实时更新
const handleValueChange = async (pluginId, changeK, item) => {
    let finalValue = item.value;

    // 根据类型，对准备发送的值进行最终处理
    if (item.type === CONFIG_TYPE.Choosing) {
        finalValue = Number(item.value);
    }
    // 【新增逻辑】如果类型是数组，将其从逗号分隔的字符串转为数字数组
    if (item.type === CONFIG_TYPE.EditArray) {
        finalValue = String(item.value).split(',').filter(i => i.trim()).map(Number);
    }

    const payload = { plugin_id: pluginId, changeK: changeK, value: finalValue };

    try {
        const response = await updateSingleConfig(payload);
        if (response.data && response.data.code === 0) {
            ElMessage({ message: `配置项 [${changeK}] 已更新`, type: 'success', duration: 1500 });
        } else {
            ElMessageBox.alert(response.data.message || '发生未知错误', '更新失败', { confirmButtonText: '好的', type: 'error' });
        }
    } catch (error) {
        const errorMessage = error.response?.data?.message || '网络请求失败';
        ElMessageBox.alert(errorMessage, '请求错误', { confirmButtonText: '好的', type: 'error' });
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

// 【重要修改】重写 "保存配置" 按钮的逻辑，实现导出JSON文件
const saveConfig = () => {
    if (!configData.value) {
        ElMessage.error('没有可导出的配置数据');
        return;
    }
    isSaving.value = true;

    try {
        // 1. 深拷贝一份当前配置，避免在处理过程中影响界面
        const dataToExport = JSON.parse(JSON.stringify(configData.value));

        // 2. 将数据处理成最终需要导出的格式 (与之前发送给后端的格式一致)
        Object.values(dataToExport).forEach(category => {
            Object.values(category).forEach(item => {
                if (item.type === CONFIG_TYPE.EditArray && typeof item.value === 'string') {
                    item.value = item.value.split(',').filter(i => i.trim()).map(Number);
                }
                if (item.type === CONFIG_TYPE.Choosing) {
                    item.value = Number(item.value);
                }
            });
        });

        // 3. 将处理好的对象转换为格式化的JSON字符串
        //    JSON.stringify(obj, null, 2) 会生成带缩进的美观格式
        const jsonString = JSON.stringify(dataToExport, null, 2);

        // 4. 创建一个 Blob 对象
        const blob = new Blob([jsonString], { type: "application/json" });

        // 5. 创建一个URL指向这个Blob对象
        const url = URL.createObjectURL(blob);

        // 6. 创建一个隐藏的 <a> 标签用于下载
        const a = document.createElement('a');
        a.href = url;
        a.download = 'config.json'; // 设置下载的文件名
        document.body.appendChild(a); // 将a标签添加到页面中
        a.click(); // 模拟点击a标签，触发下载

        // 7. 清理工作：移除a标签并释放URL对象
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

// 退出登录逻辑
// const handleLogout = () => {
//     localStorage.removeItem('user-token');
//     ElMessage.success('已成功退出登录！');
//     router.push('/login');
// };
</script>

<style scoped>
.dashboard-container {
    height: 100vh;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #dcdfe6;
}

.el-form-item {
    margin-bottom: 18px;
}

.el-card {
    height: 100%;
}
</style>
```