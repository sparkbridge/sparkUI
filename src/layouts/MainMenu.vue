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
    </el-menu>
</template>

<script setup>
import { Setting, User, Document, ChatDotRound, Trophy, Shop, MagicStick } from '@element-plus/icons-vue';

const emit = defineEmits(['select']);

const handleSelect = () => {
    emit('select');
};
</script>

<style scoped>
.el-menu {
    border-right: none;
    /* 去掉菜单右侧的边框 */
}

/* 【重要修改】
    设置菜单项在 hover（鼠标悬停）和 is-active（被选中）时的背景色 
  */
.el-menu-item:hover {
    background-color: #46586d;
    /* 一个稍亮的蓝色 */
}

.el-menu-item.is-active {
    background-color: #409EFF;
    /* 使用 Element Plus 的主蓝色作为高亮色 */
    color: #fff;
}
</style>