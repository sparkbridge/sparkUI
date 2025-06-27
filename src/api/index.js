import axios from 'axios';

// --- 配置相关的API ---
export const getGlobalConfig = () => {
    return axios.get('/api/global_config');
};
export const updateSingleConfig = (payload) => {
    return axios.post('/api/update_config', payload);
};

// --- 认证相关的API ---
export const loginUser = (credentials) => {
    return axios.post('/api/login', credentials);
}

// --- 按钮事件相关的API ---
export const triggerButtonClickEvent = (payload) => {
    return axios.post('/api/button_click_event', payload);
};


// --- 【新增】系统日志相关的API ---

// 【重要修改】模拟的日志文件现在直接存储结构化对象
const mockLogFiles = {
    '2025-06-27': [
        { timestamp: '2025-06-27 14:10:15', level: 'INFO', message: '用户 admin 登录成功。' },
        { timestamp: '2025-06-27 14:11:02', level: 'INFO', message: '系统配置已更新: debug模式已开启。' },
        { timestamp: '2025-06-27 14:11:45', level: 'WARN', message: `插件 'old-plugin' 加载缓慢，耗时超过 500ms。` },
        { timestamp: '2025-06-27 14:15:20', level: 'ERROR', message: '无法连接到第三方服务 a.com，请求超时。' },
        { timestamp: '2025-06-27 14:16:00', level: 'DEBUG', message: '收到来自 127.0.0.1 的心跳包。' },
    ],
    '2025-06-26': [
        { timestamp: '2025-06-26 18:30:00', level: 'INFO', message: '系统服务已启动，监听端口 3002。' },
        { timestamp: '2025-06-26 19:00:10', level: 'ERROR', message: '配置文件 config.json 读取失败: 文件不存在。' },
        { timestamp: '2025-06-26 20:25:05', level: 'INFO', message: '执行了备份任务。' },
    ]
};

// getLogDates 函数保持不变
export const getLogDates = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                data: {
                    code: 0,
                    data: Object.keys(mockLogFiles) // 返回所有日期的键名
                }
            });
        }, 200);
    });
  };

/**
 * 【重要修改】此函数现在返回结构化的日志对象数组
 * @param {string} date - 日期字符串, e.g., "2025-06-27"
 * @returns {Promise}
 */
export const getLogContent = (date) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (mockLogFiles[date]) {
                resolve({
                    data: {
                        code: 0,
                        data: mockLogFiles[date] // 直接返回对象数组
                    }
                });
            } else {
                reject({ message: '找不到指定日期的日志文件' });
            }
        }, 400);
    });
  };

/**
 * 【新增】获取可私聊的用户列表
 * @returns {Promise}
 */
export const getPrivateChatList = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                data: {
                    code: 0,
                    data: [
                        { id: 'user_001', name: 'Alice' },
                        { id: 'user_002', name: 'Bob' },
                        { id: 'user_003', name: 'Charlie' },
                    ]
                }
            });
        }, 300);
    });
};

/**
 * 【新增】获取可群聊的群组列表
 * @returns {Promise}
 */
export const getGroupChatList = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                data: {
                    code: 0,
                    data: [
                        { id: 'group_A', name: '项目A技术群' },
                        { id: 'group_B', name: '设计部交流群' },
                        { id: 'group_C', name: '摸鱼办' },
                    ]
                }
            });
        }, 300);
    });
};


/**
* 【新增】获取动态标语列表
* @returns {Promise}
*/
export const getSlogans = () => {
    // 模拟的标语数据
    const mockSlogans = [
        '欢迎使用 SparkBridge 管理系统',
        '专注于高效与稳定',
        '提示：请定期备份您的数据',
        '今天也要加油哦！',
        '当前时间: {time}' // {time} 是一个会被前端替换的占位符
    ];

    // 使用 Promise 和 setTimeout 模拟一个真实的异步网络请求
    return new Promise((resolve) => {
        setTimeout(() => {
            // 模拟一个标准的API响应结构
            resolve({
                data: {
                    code: 0,
                    message: '获取标语成功',
                    data: mockSlogans
                }
            });
        }, 200); // 模拟200ms的延迟
    });
};


/**
* 【新增】获取系统公告
* @returns {Promise}
*/
export const getAnnouncement = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // 模拟一个后端返回的公告对象
            const mockAnnouncement = {
                title: '系统维护通知',
                // type可以是 'success', 'info', 'warning', 'error'
                type: 'info',
                content: `为了提供更优质的服务，系统计划于 ${new Date(Date.now() + 86400000).toLocaleDateString('ja-JP')} 凌晨 2:00 至 4:00进行停机维护，届时将无法访问，请您提前做好准备。`,
                closable: true, // 控制前端是否可以关闭
                nesscary: false,
            };

            resolve({
                data: {
                    code: 0,
                    data: mockAnnouncement
                }
            });
        }, 400); // 模拟延迟
    });
};

/**
 * 【新增】获取赞助商列表
 * @returns {Promise}
 */
export const getSponsors = () => {
    return new Promise((resolve) => {
        // 模拟的赞助商数据
        const mockSponsors = [
            { id: 1, name: '顶尖赞助商A', logoUrl: 'https://placehold.co/120x60/409eff/FFF?text=Sponsor+A', websiteUrl: 'https://example.com', message: '全力支持SparkBridge项目！' },
            { id: 2, name: '赞助伙伴B', logoUrl: 'https://placehold.co/120x60/67c23a/FFF?text=Sponsor+B', websiteUrl: 'https://example.com', message: '祝项目越来越好。' },
            { id: 3, name: '优秀支持者C', logoUrl: 'https://placehold.co/120x60/e6a23c/FFF?text=Sponsor+C', websiteUrl: 'https://example.com', message: '非常看好这个项目的未来前景和发展潜力。' },
            { id: 4, name: '赞助商D', logoUrl: 'https://placehold.co/120x60/f56c6c/FFF?text=Sponsor+D', websiteUrl: 'https://example.com', message: '加油！' },
            { id: 5, name: '赞助商E', logoUrl: 'https://placehold.co/120x60/909399/FFF?text=Sponsor+E', websiteUrl: 'https://example.com', message: '期待更多新功能。' },
            { id: 6, name: '赞助商F', logoUrl: 'https://placehold.co/120x60/303133/FFF?text=Sponsor+F', websiteUrl: 'https://example.com', message: '为开源社区做贡献！' },
          ];
        setTimeout(() => {
            resolve({
                data: {
                    code: 0,
                    data: mockSponsors
                }
            });
        }, 300);
    });
  };


/**
* 【新增】获取插件列表
* @returns {Promise}
*/
export const getPlugins = () => {
    return new Promise((resolve) => {
        const mockPlugins = [
            { id: 'plugin_001', name: '聊天增强插件', description: '为聊天框增加表情、图片预览等多种实用功能。', imageUrl: 'https://placehold.co/400x200/409eff/FFF?text=Chat+', tags: ['热销', '推荐'], githubUrl: 'https://github.com' },
            { id: 'plugin_002', name: '日志分析器', description: '自动分析系统日志，高亮关键错误并提供解决方案建议。', imageUrl: 'https://placehold.co/400x200/67c23a/FFF?text=Logger', tags: ['推荐', '工具'], githubUrl: 'https://github.com' },
            { id: 'plugin_003', name: '数据备份工具', description: '提供一键备份和恢复系统配置及数据的功能。', imageUrl: 'https://placehold.co/400x200/e6a23c/FFF?text=Backup', tags: ['工具'], githubUrl: 'https://github.com' },
            { id: 'plugin_004', name: '主题美化', description: '提供多种自定义主题，让你的管理面板与众不同。', imageUrl: 'https://placehold.co/400x200/f56c6c/FFF?text=Theme', tags: ['美化'], githubUrl: 'https://github.com' },
            { id: 'plugin_005', name: '性能监视器', description: '实时监控系统性能指标，包括CPU、内存占用等。', imageUrl: 'https://placehold.co/400x200/909399/FFF?text=Monitor', tags: ['热销', '工具'], githubUrl: 'https://github.com' },
            { id: 'plugin_006', name: '权限管理扩展', description: '提供更精细化的用户权限控制和角色分配。', imageUrl: 'https://placehold.co/400x200/303133/FFF?text=Auth', tags: ['安全'], githubUrl: 'https://github.com' },
        ];
        setTimeout(() => {
            resolve({ data: { code: 0, data: mockPlugins } });
        }, 500);
    });
};

/**
 * 【新增】模拟下载插件的API调用
 * @param {string} pluginId 
 * @returns {Promise}
 */
export const downloadPlugin = (pluginId) => {
    return new Promise((resolve) => {
        console.log(`正在向服务器请求下载插件: ${pluginId}`);
        setTimeout(() => {
            resolve({
                data: {
                    code: 0,
                    message: `插件 [${pluginId}] 已成功添加到下载队列！`
                }
            });
        }, 700);
    });
  };