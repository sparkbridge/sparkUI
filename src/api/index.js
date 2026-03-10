// src/api/index.js
import request from './request';

export const api = {
    // ==========================
    // 1. 认证授权相关 (Auth)
    // ==========================

    /**
     * 登录系统
     * @param {string} password - 用户密码
     */
    login: async (password) => {
        // 拦截器已经处理了 response.data，所以这里直接 return 即可
        const res = await request.post('/auth/login', { password });
        return res;
    },

    /**
     * 验证 Token 是否有效
     */
    verifyToken: () => {
        return request.get('/auth/verify');
    },


    // ==========================
    // 2. 面板与概览相关 (Dashboard)
    // ==========================

    /**
     * 获取系统概览数据
     */
    getOverview: () => {
        return request.get('/overview');
    },


    // ==========================
    // 3. 插件与页面管理 (Plugins)
    // ==========================

    /**
     * 获取插件列表
     */
    getPlugins: () => {
        return request.get('/plugins/list');
    },

    /**
     * 获取自定义插件页面列表
     */
    getCustomPages: () => {
        return request.get('/plugins/custom-pages');
    },


    // ==========================
    // 4. 动态配置相关 (Schema Config)
    // ==========================

    /**
     * 获取某个插件的 Schema 配置
     * @param {string} name - 插件名称
     */
    getConfig: (name) => {
        return request.get(`/plugins/config/${name}`);
    },

    /**
     * 保存/更新某个插件的键值对配置
     * @param {string} name - 插件名称
     * @param {Object} data - 配置数据
     */
    saveConfig: (name, data) => {
        return request.post(`/plugins/config/${name}`, data);
    },

    getCustomPages: () => {
        return request.get('/custom_pages');
    },
    getRegexRules:()=>{
        return request.get('/plugin/regexengine/list');
    },
    saveRegexRules:(data)=>{
        return request.post('/plugin/regexengine/save',data);
    },

    installPlugin: (url) => {
        return request.post(`/plugins/task/download`,{url});
    },
    
};