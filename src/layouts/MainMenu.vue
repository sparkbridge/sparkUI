<template>
    <el-menu active-text-color="#ffffff" background-color="#2c3e50" class="el-menu-vertical-demo"
        :default-active="$route.path" text-color="rgba(255, 255, 255, 0.7)" :router="true" @select="handleSelect">
        <el-menu-item index="/dashboard">
            <el-icon>
                <Setting />
            </el-icon>
            <span>配置面板</span>
        </el-menu-item>
        <el-menu-item index="/user-management">
            <el-icon>
                <User />
            </el-icon>
            <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/system-logs">
            <el-icon>
                <Document />
            </el-icon>
            <span>系统日志</span>
        </el-menu-item>
        <el-menu-item index="/market">
            <el-icon>
                <Shop />
            </el-icon>
            <span>插件市场</span>
        </el-menu-item>
        <el-menu-item index="/chat">
            <el-icon>
                <ChatDotRound />
            </el-icon>
            <span>虚拟聊天</span>
        </el-menu-item>
        <el-menu-item index="/rules-engine">
            <el-icon>
                <MagicStick />
            </el-icon>
            <span>规则引擎</span>
        </el-menu-item>
        <el-menu-item index="/showcase">
            <el-icon>
                <Trophy />
            </el-icon>
            <span>关于我们</span>
        </el-menu-item>
        <div v-if="isMobile" class="logout-menu-item" @click="handleLogoutClick">
            <el-icon>
                <SwitchButton />
            </el-icon>
            <span>退出登录</span>
        </div>
    </el-menu>
</template>

<script setup>
import { Setting, User, Document, ChatDotRound, Trophy, Shop, MagicStick,SwitchButton } from '@element-plus/icons-vue';

const emit = defineEmits(['select']);

// 【新增】接收 isMobile prop
const props = defineProps({
    isMobile: {
        type: Boolean,
        default: false,
    }
});

const handleSelect = () => {
    emit('select');
};

// 【新增】当点击退出登录时，向父组件发出 logout 事件
const handleLogoutClick = () => {
    emit('logout');
};
</script>

<style scoped>
/* 【重要修改】使用 flex 布局来分隔菜单项和底部的退出按钮 */
.main-menu-container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    border-right: none;
}
/* 【新增】移动端退出登录按钮的样式 */
.logout-menu-item {
    display: flex;
    align-items: center;
    height: 56px;
    line-height: 56px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    padding: 0 20px;
    cursor: pointer;
    transition: background-color 0.3s;
}
.logout-menu-item:hover {
    background-color: #46586d;
}

.logout-menu-item .el-icon {
    margin-right: 5px;
}
.el-menu {
    border-right: none;
    /* 去掉菜单右侧的边框 */
}

/* 【重要修改】
    设置菜单项在 hover（鼠标悬停）和 is-active（被选中）时的背景色 
  */


.el-menu-item:hover {
    background-color: #46586d;
}

.el-menu-item.is-active {
    background-color: #409EFF;
    color: #fff;
}
</style>