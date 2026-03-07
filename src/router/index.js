import { createRouter, createWebHistory } from 'vue-router';
import { showNotice } from '../utils/notice';

// 1. 定义页面组件 (建议使用动态导入以优化性能)
const MainLayout = () => import('../layouts/MainLayout.vue');
const Login = () => import('../views/Login.vue');
const SystemOverview = () => import('../views/SystemOverview.vue');
const Dashboard = () => import('../views/Dashboard.vue');

const routes = [
    // 登录页：独立于外壳之外
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: { requiresAuth: false }
    },

    // 主布局外壳
    {
        path: '/',
        component: MainLayout,
        redirect: '/overview', // 默认进入概览页
        children: [
            {
                path: 'overview',
                name: 'SystemOverview',
                component: SystemOverview,
                meta: { title: '系统概览', requiresAuth: true }
            },
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: Dashboard,
                meta: { title: '插件管理', requiresAuth: true }
            },
            {
                path:"regexengine",
                name: 'RegexEngine',
                component: () => import('../views/RegexEngine.vue'),
                meta: { title: '正则引擎', requiresAuth: true }
            },
            {
                path: 'custom/:id',
                name: 'CustomPage',
                component: () => import('../views/CustomPageView.vue'),
                meta: { title: '插件页面' }
            }
        ]
    },

    // 404 兜底 (可选)
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    // 切换路由时自动滚动到顶部
    scrollBehavior() {
        return { top: 0 };
    }
});

// src/router/index.js
// src/router/index.js
import { api } from '../api'; // 确保你引入了 api

// 注意：参数里已经不需要写 next 了
router.beforeEach(async (to, from) => {
    const token = localStorage.getItem('sb3_token');

    // 设置网页标题
    if (to.meta.title) {
        document.title = `${to.meta.title} - SparkBridge3`;
    }

    // 1. 访问登录页的处理
    if (to.name === 'Login') {
        if (token) {
            // 如果已经有 token，直接重定向到概览页
            return { name: 'SystemOverview' };
        }
        // 允许进入登录页
        return true;
    }

    // 2. 访问受保护页面的处理
    if (to.meta.requiresAuth !== false) {
        // 没 token，直接踢回登录页
        if (!token) {
            return { name: 'Login' };
        }

        try {
            // 向后端验证 token 有效性
            await api.verifyToken();
            // 验证通过，放行
            return true;
        } catch (err) {
            // 验证失败：中断当前页面的进入动作
            // 注意：具体的清空 token 和跳转 /login 的动作，已经在 request.js 的 axios 拦截器里做过了，这里只需要返回 false 阻止路由继续渲染即可。
            return false;
        }
    }

    // 3. 兜底放行（访问其他不需要权限的公共页面）
    return true;
});

export default router;