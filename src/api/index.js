import axios from 'axios';

const global_config = { "status": "success", "message": "GET request for globa_config received.", "data": { "base": { "target": { "type": 4, "value": "ws://127.0.0.1:3001", "desc": "连接地址" }, "qid": { "type": 5, "value": 114514, "desc": "QQ号码" }, "pwd": { "type": 4, "value": "12345678", "desc": "连接密码" }, "onebot_mode_v11": { "type": 2, "value": true, "desc": "是否使用onebot适配器" }, "debugMode": { "type": 2, "value": false, "desc": "开发者模式" } }, "telemetry": { "webPort": { "type": 5, "value": 3002, "desc": "网页端口" }, "allow_global": { "type": 2, "value": true, "desc": "是否允许外网访问" }, "lock_panel": { "type": 2, "value": false, "desc": "是否锁定面板,锁定后只能提供私聊机器人获取临时密码" }, "reply_after_auth": { "type": 2, "value": true, "desc": "登入面板后是否提醒" }, "pwd_timeout": { "type": 5, "value": 5, "desc": "密码过期时间（单位分钟）" } }, "mc": { "group": { "type": 5, "value": 114514, "desc": "监听的群聊" }, "admins": { "type": 1, "value": [1919810], "desc": "管理员列表（请仅填入数字）" } }, "JandLandCmsg": { "join": { "type": 2, "value": true, "desc": "是否开启加入提示" }, "left": { "type": 2, "value": true, "desc": "是否开启离开提示" }, "chat_group": { "type": 2, "value": true, "desc": "是否转发消息到群聊" }, "chat_server": { "type": 2, "value": false, "desc": "是否转发消息到服务器（默认为关闭，默认的正则表达式附带了chat xxxx的正则）" }, "chatMaxLength": { "type": 5, "value": 20, "desc": "聊天最大字数长度" }, "chatShield": { "type": 1, "value": ["傻逼"], "desc": "聊天屏蔽词语" } }, "JandLandCmsg_lang": { "join": { "type": 4, "value": "%PLAYER_NAME% 进入了服务器", "desc": "加入服务器向群聊中发送的消息" }, "left": { "type": 4, "value": "%PLAYER_NAME% 离开了服务器", "desc": "离开服务器向群聊中发送的消息" }, "chat_group": { "type": 4, "value": "%PLAYER_NAME% \u003E\u003E %PLAYER_MSG%", "desc": "发送到群聊的聊天信息格式" }, "chat_server": { "type": 4, "value": "[群聊]%USER_XBOXID% \u003E\u003E %PLAYER_MSG%", "desc": "发送到服务器的聊天信息格式" } }, "niuzi": { "pkCD": { "type": 5, "value": 2, "desc": "功能「比划比划」的冷却时长，单位为分。" }, "init_cm": { "type": 5, "value": 10, "desc": "功能「领养牛子」的初始成长最大值。" }, "reget_cd": { "type": 5, "value": 6, "desc": "丢弃牛子后的冷却CD，单位分钟" }, "tt_cd": { "type": 5, "value": 40, "desc": "功能「贴贴」的冷却时长，单位为分。" }, "tt_grow": { "type": 5, "value": 120, "desc": "功能「贴贴」的成长值" }, "win_p": { "type": 5, "value": 0.4, "desc": "赢的概率" }, "los_p": { "type": 5, "value": 0.5, "desc": "输的概率" }, "dorp_p": { "type": 5, "value": 0.1, "desc": "双输的概率" } }, "autocomplete": { "rep_1": { "type": 1, "value": ["让我看看谁没有补全括号？", "TNND，为什么不补齐？"], "desc": "补全的时候说的话" }, "rep_2": { "type": 1, "value": ["让我看看谁没有补全括号？哦，补不上", "为什么自己就补全了？爬"], "desc": "无法补全的时候说的话" } } } }

// --- 配置相关的API ---
export const getGlobalConfig = () => {
    // return axios.get('/api/global_config');
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                data: global_config
            });
        }, 200);
    });

};
export const updateSingleConfig = (payload) => {
    return axios.post('/api/update_config', payload);
};

// --- 认证相关的API ---
export const loginUser = (credentials) => {
    // return axios.post('/api/login', credentials);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                data:{
                    code : 0,
                    data: {token: '1234567890'}
                }
            });
        }, 200);
    });
}

// --- 按钮事件相关的API ---
export const triggerButtonClickEvent = (payload) => {
    return axios.post('/api/button_click_event', payload);
};


// --- 【新增】系统日志相关的API ---

const mockLogFiles = {
    '2025-06-28': [
        { timestamp: '2025-06-28 14:10:15', level: 'INFO', module: 'Auth', message: '用户 admin 登录成功。' },
        { timestamp: '2025-06-28 14:11:02', level: 'INFO', module: 'Config', message: '系统配置已更新: debug模式已开启。' },
        { timestamp: '2025-06-28 14:11:45', level: 'WARN', module: 'PluginMarket', message: `插件 'old-plugin' 加载缓慢，耗时超过 500ms。` },
        { timestamp: '2025-06-28 14:15:20', level: 'ERROR', module: 'Database', message: '无法连接到数据库服务，请求超时。' },
        { timestamp: '2025-06-28 14:16:00', level: 'DEBUG', module: 'WebServer', message: '收到来自 127.0.0.1 的心跳包。' },
        { timestamp: '2025-06-28 15:00:00', level: 'INFO', module: 'RulesEngine', message: '规则 "欢迎新用户" 已成功触发。' },
    ],
    '2025-06-27': [
        { timestamp: '2025-06-27 18:30:00', level: 'INFO', module: 'WebServer', message: '系统服务已启动，监听端口 3002。' },
        { timestamp: '2025-06-27 19:00:10', level: 'ERROR', module: 'Config', message: '配置文件 config.json 读取失败: 文件不存在。' },
        { timestamp: '2025-06-27 20:25:05', level: 'INFO', module: 'Backup', message: '执行了备份任务。' },
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


// 模拟后端的插件数据库和它们的状态
let mockPluginsDB = [
    { id: 'plugin_001', name: '聊天增强插件', description: '为聊天框增加表情、图片预览等多种实用功能。', imageUrl: 'https://placehold.co/400x200/409eff/FFF?text=Chat+', tags: ['热销', '推荐'], githubUrl: 'https://github.com', status: 'not_installed' },
    { id: 'plugin_002', name: '日志分析器', description: '自动分析系统日志，高亮关键错误并提供解决方案建议。', imageUrl: 'https://placehold.co/400x200/67c23a/FFF?text=Logger', tags: ['推荐', '工具'], githubUrl: 'https://github.com', status: 'installed' }, // 假设这个已安装
    { id: 'plugin_003', name: '数据备份工具', description: '提供一键备份和恢复系统配置及数据的功能。', imageUrl: 'https://placehold.co/400x200/e6a23c/FFF?text=Backup', tags: ['工具'], githubUrl: 'https://github.com', status: 'not_installed' },
    // ... 其他插件
];

// 模拟安装任务的状态
const installationStatus = {};

// 获取插件列表（现在会包含status字段）
export const getPlugins = () => new Promise(res => setTimeout(() => res({ data: { code: 0, data: JSON.parse(JSON.stringify(mockPluginsDB)) } }), 500));

// 点击下载，后端开始安装（模拟）
export const downloadPlugin = (pluginId) => new Promise(res => {
    console.log(`后端开始安装插件: ${pluginId}`);
    installationStatus[pluginId] = 'installing';
    // 模拟一个较长的安装过程 (5秒)
    setTimeout(() => {
        installationStatus[pluginId] = 'installed';
        // 更新“数据库”中的状态
        const plugin = mockPluginsDB.find(p => p.id === pluginId);
        if (plugin) plugin.status = 'installed';
        console.log(`后端安装完成: ${pluginId}`);
    }, 5000);
    // 立刻返回成功，告诉前端可以开始轮询了
    res({ data: { code: 0, message: '已开始安装任务' } });
});

// 【新增】轮询插件状态的API
export const getPluginStatus = (pluginId) => new Promise(res => {
    const status = installationStatus[pluginId] || 'not_installed';
    console.log(`查询插件 ${pluginId} 的状态: ${status}`);
    setTimeout(() => {
        res({ data: { code: 0, data: { status } } });
    }, 300);
});

// 【新增】卸载插件的API
export const uninstallPlugin = (pluginId) => new Promise(res => {
    console.log(`后端开始卸载插件: ${pluginId}`);
    const plugin = mockPluginsDB.find(p => p.id === pluginId);
    if (plugin) plugin.status = 'not_installed';
    delete installationStatus[pluginId];
    setTimeout(() => {
        res({ data: { code: 0, message: `插件 [${pluginId}] 已成功卸载` } });
    }, 500);
});


// 【重要修改】更新模拟规则的数据结构，增加一条使用新功能的规则
const mockRules = [
    {
        id: 'rule_1',
        name: '新人入群欢迎',
        eventType: 'group_join',
        conditions: [
            { id: 'cond_1_1', type: 'group_id', operator: 'equals', value: '10001' }
        ],
        actions: [
            { id: 'act_1_1', type: 'reply_text', value: '欢迎新成员！请阅读群公告。' },
            { id: 'act_1_2', type: 'reply_image', value: 'https://placehold.co/400x200/409eff/FFF?text=Welcome!' },
        ]
    },
    {
        id: 'rule_2',
        name: '管理员指令',
        eventType: 'private_chat',
        conditions: [
            // 【新功能示例】这里我们比较“用户ID”是否“等于变量”中的“adminQQ”
            { id: 'cond_2_1', type: 'user_id', operator: 'equals_variable', value: 'adminQQ' },
            { id: 'cond_2_2', type: 'message_content', operator: 'equals', value: 'status' }
        ],
        actions: [
            { id: 'act_2_1', type: 'reply_text', value: '管理员您好，系统运行正常。' }
        ]
    }
  ];
const mockVariables = [
    { id: 'var_1', key: 'adminQQ', value: '10001' },
    { id: 'var_2', key: 'newUserGreeted', value: 'false' },
  ];
export const getRulesEngineData = () => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                data: {
                    code: 0,
                    data: {
                        rules: mockRules,
                        variables: mockVariables
                    }
                }
            });
        }, 300);
    });
};

export const saveRules = (rules) => new Promise(res => { console.log('保存规则:', rules); setTimeout(() => res({ data: { code: 0, message: '规则保存成功' } }), 300); });
export const saveVariables = (vars) => new Promise(res => { console.log('保存变量:', vars); setTimeout(() => res({ data: { code: 0, message: '变量保存成功' } }), 300); });