import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../layouts/layout.vue' // 引入主布局组件
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Dashboard from '../views/Dashboard.vue'
import UserManagement from '../views/UserManagement.vue'
import SystemLogs from '../views/SystemLogs.vue'
import Chat from '../views/Chat.vue'
import Showcase from '../views/ShowCase.vue'; 
import PluginMarket from '../views/PluginMarket.vue'; // 引入新页面

const routes = [
    // 登录和注册页面是独立的，不使用主布局
    {
        path: '/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/register',
        name: 'Register',
        component: Register
    },
    // 所有需要导航栏的内部页面，都作为 Layout 的子路由
    {
        path: '/',
        component: Layout,
        meta: { requiresAuth: true }, // 在父路由上添加认证守卫
        redirect: '/dashboard', // 访问根路径时，默认重定向到仪表盘
        children: [
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: Dashboard
            },
            {
                path: 'user-management',
                name: 'UserManagement',
                component: UserManagement
            },
            {
                path: 'system-logs',
                name: 'SystemLogs',
                component: SystemLogs
            },
            {
                path: 'chat',
                name: 'Chat',
                component: Chat
            },
            {
                path: 'showcase',
                name: 'Showcase',
                component: Showcase
              },
            {
                path: 'market',
                name: 'PluginMarket',
                component: PluginMarket
              }
        ]
    },
    // 兜底路由保持不变
    {
        path: '/:pathMatch(.*)*',
        redirect: '/login'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 全局前置路由守卫保持不变
router.beforeEach((to, from, next) => {
    const loggedIn = localStorage.getItem('user-token');

    if (to.meta.requiresAuth && !loggedIn) {
        next('/login');
    } else if ((to.name === 'Login' || to.name === 'Register') && loggedIn) {
        next('/dashboard');
    }
    else {
        next();
    }
});

export default router