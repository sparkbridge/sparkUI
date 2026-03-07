// src/api/request.js
import axios from 'axios';
import router from '../router'; // 引入路由，用于强制跳转
import { showNotice } from '../utils/notice'; // 你的全局提示工具

// 创建 Axios 实例
const service = axios.create({
    baseURL: '/api', // 基础路径，Vite 代理通常拦截 /api
    timeout: 10000,  // 超时时间 10 秒
});

// 防止多个并发请求同时触发 403 导致弹窗满天飞
let isRelogin = false;

// ==========================================
// 1. 请求拦截器 (发出去之前)
// ==========================================
service.interceptors.request.use(
    (config) => {
        // 每次发请求前，动态获取最新的 token
        const token = localStorage.getItem('sb3_token');
        if (token) {
            // 按照标准携带 Bearer Token
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ==========================================
// 2. 响应拦截器 (收到数据之后)
// ==========================================
service.interceptors.response.use(
    (response) => {
        const res = response.data;

        // ★ 核心修复：如果是登录接口，直接原封不动返回，让 Login.vue 自己处理对错
        if (response.config.url.includes('/login')) {
            return res;
        }

        // 判断业务状态码 (非登录接口的通用拦截)
        if (res.code !== 200) {
            if (res.code === 401 || res.code === 403) {
                if (!isRelogin) {
                    isRelogin = true;
                    localStorage.removeItem('sb3_token');
                    showNotice(res.msg || '登录身份已过期，请重新登录', 'error');
                    setTimeout(() => {
                        isRelogin = false;
                        router.push('/login');
                    }, 1500);
                }
                return new Promise(() => { }); // 挂起，中断后续执行
            }
            showNotice(res.msg || '请求失败', 'warning');
            return Promise.reject(new Error(res.msg || 'Error'));
        }

        return res;
    },
    (error) => {
        // ★ 核心修复：如果是登录接口的 HTTP 层面报错（如 401/403/500），直接抛出给 catch 处理
        if (error.response && error.response.config.url.includes('/login')) {
            return Promise.reject(error);
        }

        if (error.response) {
            const status = error.response.status;
            if (status === 401 || status === 403) {
                if (!isRelogin) {
                    isRelogin = true;
                    localStorage.removeItem('sb3_token');
                    showNotice('登录验证失效，请重新登录', 'error');
                    setTimeout(() => {
                        isRelogin = false;
                        router.push('/login');
                    }, 1500);
                }
                return new Promise(() => { });
            }
            showNotice(`服务器异常 [${status}]`, 'error');
        } else {
            showNotice('网络连接中断或请求超时', 'error');
        }

        return Promise.reject(error);
    }
);

export default service;