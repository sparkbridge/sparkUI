<template>
    <el-row :gutter="20" class="chat-container">

        <el-col :md="8" :sm="24" :xs="24" class="settings-col">
            <el-card>
                <template #header>
                    <div>聊天设置</div>
                </template>
                <el-form label-position="top">
                    <el-form-item label="聊天类型">
                        <el-select v-model="chatType" placeholder="请选择" style="width: 100%;">
                            <el-option label="私聊" value="private"></el-option>
                            <el-option label="群聊" value="group"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="chatType === 'private' ? '选择用户' : '选择群组'">
                        <el-select v-model="selectedTarget" placeholder="请选择" style="width: 100%;" filterable>
                            <el-option v-for="target in currentTargetList" :key="target.id" :label="target.name"
                                :value="target.id" />
                        </el-select>
                    </el-form-item>

                    <el-form-item label="模拟接收消息">
                        <div class="simulation-buttons">
                            <el-button @click="simulateReceiveText">模拟接收文本</el-button>
                            <el-button @click="simulateReceiveImage">模拟接收图片</el-button>
                        </div>
                    </el-form-item>
                </el-form>
            </el-card>
        </el-col>

        <el-col :md="16" :sm="24" :xs="24" class="chat-col">
            <el-card class="chat-box">
                <template #header>
                    <div class="chat-header"><span>{{ currentTargetName || '未选择聊天对象' }}</span></div>
                </template>
                <div class="message-area" ref="messageAreaRef">
                    <div v-for="(msg, index) in messages" :key="index" class="message-bubble"
                        :class="{ 'is-me': msg.sender === 'me' }">
                        <div v-if="msg.type === 'text'" class="message-content">{{ msg.content }}</div>
                        <div v-else-if="msg.type === 'image'" class="message-content image">
                            <el-image style="width: 150px; height: auto; border-radius: 5px; vertical-align: bottom;"
                                :src="msg.content" :preview-src-list="[msg.content]" fit="contain"
                                hide-on-click-modal />
                        </div>
                    </div>
                </div>
                <div class="input-area">
                    <el-input v-model="newMessage" type="textarea" :rows="3" resize="none" placeholder="输入消息或在此处粘贴图片..."
                        @keyup.enter.prevent="sendMessage" @paste="handlePaste"></el-input>
                    <div class="action-buttons">
                        <el-button :icon="Link" circle @click="promptForImageUrl" title="按URL发送图片" />
                        <el-button type="primary" @click="sendMessage">发送</el-button>
                    </div>
                </div>
            </el-card>
        </el-col>
    </el-row>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { getPrivateChatList, getGroupChatList } from '../api'; // 不再需要 uploadImage
import { Link } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// --- 状态定义等... (保持不变) ---
const chatType = ref('private');
const selectedTarget = ref(null);
const privateChatList = ref([]);
const groupChatList = ref([]);
const messages = ref([]);
const newMessage = ref('');
const messageAreaRef = ref(null);
const currentTargetList = computed(() => chatType.value === 'private' ? privateChatList.value : groupChatList.value);
const currentTargetName = computed(() => currentTargetList.value.find(t => t.id === selectedTarget.value)?.name || '');

// --- 方法 ---

// 统一的消息添加函数，它已经可以处理不同类型
const addMessage = (content, sender, type = 'text') => {
    messages.value.push({ content, sender, type });
};

// 【重要修改】修改 receiveMessage 函数，使其能处理一个完整的消息对象
const receiveMessage = (messageObject) => {
    // 我们假定所有来自对方的消息，sender 都是 'other'
    addMessage(messageObject.content, 'other', messageObject.type);
};

// 【新增】模拟接收文本消息的按钮点击事件
const simulateReceiveText = () => {
    const textMessage = {
        type: 'text',
        content: '这是对方发来的一条测试文本。'
    };
    receiveMessage(textMessage);
};

// 【新增】模拟接收图片消息的按钮点击事件
const simulateReceiveImage = () => {
    const imageUrl = 'https://placehold.co/600x400/f56c6c/FFF.png?text=Other+Side';
    const imageMessage = {
        type: 'image',
        content: imageUrl
    };
    receiveMessage(imageMessage);
};

const sendMessage = () => {
    if (!selectedTarget.value) {
        event.preventDefault(); // 阻止粘贴
        ElMessage.warning('请先选择一个聊天对象！');
        return;
    }
    if (!newMessage.value.trim()) return;
    addMessage(newMessage.value, 'me', 'text');
    newMessage.value = '';
};


const promptForImageUrl = async () => {
    try {
        const { value } = await ElMessageBox.prompt('请输入图片的URL地址', '发送图片', {
            confirmButtonText: '发送',
            cancelButtonText: '取消',
            inputPlaceholder: 'https://example.com/image.png'
        });
        if (value && (value.startsWith('http://') || value.startsWith('https://'))) {
            addMessage(value, 'me', 'image');
        } else {
            ElMessage.error('请输入有效的URL地址');
        }
    } catch {
        ElMessage.info('已取消发送');
    }
};

// 【重要修改】处理粘贴事件的函数
const handlePaste = (event) => {
    if (!selectedTarget.value) {
        event.preventDefault(); // 阻止粘贴
        ElMessage.warning('请先选择一个聊天对象！');
        return;
    }
    const items = event.clipboardData?.items;
    if (!items) return;

    let imageFile = null;
    for (const item of items) {
        if (item.kind === 'file' && item.type.startsWith('image/')) {
            imageFile = item.getAsFile();
            break;
        }
    }

    if (imageFile) {
        // 阻止默认的粘贴行为 (比如粘贴文件路径)
        event.preventDefault();

        // 创建一个 FileReader 实例
        const reader = new FileReader();

        // 定义当文件读取完成后要执行的操作
        reader.onload = (e) => {
            // e.target.result 包含了图片的 Base64 Data URL
            const base64Content = e.target.result;
            // 将这张图片添加到聊天记录中
            addMessage(base64Content, 'me', 'image');
        };

        // 定义文件读取失败的操作
        reader.onerror = () => {
            ElMessage.error('图片读取失败！');
        };

        // 开始读取文件，并将其转换为 Data URL
        reader.readAsDataURL(imageFile);
    }
    // 如果剪贴板里没有图片文件，我们什么都不做，让默认的文本粘贴行为自然发生
};


const scrollToBottom = () => {
    nextTick(() => {
        if (messageAreaRef.value) {
            messageAreaRef.value.scrollTop = messageAreaRef.value.scrollHeight;
        }
    });
};

watch(messages, scrollToBottom, { deep: true });
watch(chatType, () => { selectedTarget.value = null; });

onMounted(async () => {
    const [privateRes, groupRes] = await Promise.all([getPrivateChatList(), getGroupChatList()]);
    privateChatList.value = privateRes.data.data;
    groupChatList.value = groupRes.data.data;
    messages.value = [
        { type: 'text', content: '你好，我是 Spark。', sender: 'other' },
        { type: 'text', content: '现在你可以试着粘贴一张图片到这里。', sender: 'other' },
    ];
});
</script>

<style scoped>
/* 样式保持不变 */
.chat-container {
    height: calc(100vh - 100px);
}

.settings-col {
    margin-bottom: 20px;
}

.chat-box {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.chat-box :deep(.el-card__body) {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0;
}

.chat-header {
    text-align: center;
}

.message-area {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background-color: #f5f7fa;
}

.input-area {
    display: flex;
    align-items: flex-end;
    padding: 10px;
    border-top: 1px solid #e4e7ed;
}

.action-buttons {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-left: 10px;
    height: 72px;
}

.message-bubble {
    display: flex;
    margin-bottom: 15px;
}

.message-bubble .message-content {
    max-width: 70%;
    padding: 10px 15px;
    border-radius: 10px;
    word-break: break-word;
}

.message-bubble:not(.is-me) {
    justify-content: flex-start;
}

.message-bubble:not(.is-me) .message-content {
    background-color: #ffffff;
    border: 1px solid #e4e7ed;
}

.message-bubble.is-me {
    justify-content: flex-end;
}

.message-bubble.is-me .message-content {
    background-color: #409eff;
    color: #fff;
}

.message-content.image {
    background-color: transparent !important;
    border: none !important;
    padding: 0;
}
.simulation-buttons {
    display: flex;
    gap: 10px;
}
</style>