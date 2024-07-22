const db = require('../config/dbConfig');
const { generateToken } = require('../utils/jwtUtils');
const { authMiddleware, logoutMiddleware } = require('../middleware/authMiddleware');
const { generateUniqueRandomNumber } = require('../utils/index');

/**
 * 检查用户是否存在
 *
 * @param username 用户名
 * @returns 如果用户存在返回true，否则返回false
 */
async function checkUserExists(ctx) {
    const { username } = ctx.request.body;
    try {
        const [users] = await db.query('SELECT * FROM user_list WHERE username = ?', [username]);
        if (users.length > 0) {
            ctx.status = 200;  // 用户已存在
            ctx.body = { code: 200, message: '用户名已存在！', user_id: users[0].user_id, };
            return;
        } else {
            ctx.status = 200;  // 用户不存在
            ctx.body = { code: 200, message: '用户名不存在！', user_id: '' };
            return;
        }
    } catch (error) {
        console.error('Failed to query user:', error);
        // 查询失败或没有找到用户
        ctx.status = 500;
        ctx.body = { code: 500, error: '用户查询异常！' };
    }
}

/**
 * 注册用户函数
 *
 * @param ctx 上下文对象
 * @returns Promise<void> 无返回值，但会修改 ctx 对象的 status 和 body 属性
 */
async function register(ctx) {
    const { username, password, email } = ctx.request.body;

    // 首先检查用户是否已存在
    const [users] = await db.query('SELECT * FROM user_list WHERE username = ?', [username]);

    if (users.length > 0) {
        ctx.status = 200;  // 用户已存在
        ctx.body = { code: 200, message: '用户已存在,可返回登录页进行登录', user_id: users[0].user_id, };
        return;
    }

    const user_id = generateUniqueRandomNumber(6, 8);
    // 实现注册逻辑，将用户名和加密后的密码存入数据库
    try {
        // 示例代码，实际应用中需进行密码加密存储
        const [result] = await db.query('INSERT INTO user_list (user_id,username, password, email) VALUES (?, ?, ?, ?)', [user_id, username, password, email]);
        ctx.status = 200;
        ctx.body = { code: 200, message: '注册成功', username };
    } catch (error) {
        console.log(error);
        ctx.status = 500;
        ctx.body = { code: 500, error: '注册用户失败' };
    }
}

/**
 * 登录函数
 *
 * @param ctx 上下文对象
 * @returns 返回一个Promise，表示登录操作的结果
 */
async function login(ctx) {
    const { username, emial, password } = ctx.request.body;
    // 实现登录逻辑，验证用户名和密码，生成并返回 JWT
    try {
        const [users] = await db.query('SELECT * FROM user_list WHERE username = ? AND password = ?', [username, password]);

        if (users.length === 0) {
            ctx.status = 401;
            ctx.body = { code: 401, error: '用户名或密码错误,请重新输入' };
        } else {
            const token = generateToken({ username, user_id: users[0].user_id });
            ctx.status = 200;
            ctx.body = { code: 200, token, user_id: users[0].user_id };
        }
    } catch (error) {
        ctx.status = 500;
        ctx.body = { code: 500, error: '身份验证失败' };
    }
}

/**
 * 登出函数
 *
 * @param ctx 上下文对象
 * @returns 返回一个Promise，表示登出操作是否完成
 */
async function logout(ctx) {
    try {
        logoutMiddleware(ctx); // 加入黑名单
        ctx.status = 200;
        ctx.body = { code: 200, message: '退出成功', };
    } catch (error) {
        console.log(error);
        ctx.status = 500;
        ctx.body = { code: 500, error: '登出失败' };
    }
}

/**
 * 获取用户信息
 *
 * @param ctx Koa上下文对象
 * @returns Promise<void>
 */
async function getUserInfo(ctx) {
    let { user_id } = ctx.request.body;
    try {
        // 验证用户是否登录
        await authMiddleware(ctx, async () => {
            // const { user } = ctx.state;
            const [users] = await db.query('SELECT id,  username, user_id, email, nick, avatar, gender, birthday, phone, registration_time, signature FROM user_list WHERE user_id = ?', [user_id]);
            
            
            if (users.length === 0) {
                ctx.status = 404;
                ctx.body = { code: 401, error: '用户不存在' };
            } else {
                const user = users[0];
                ctx.status = 200;
                ctx.body = { code: 200, message: '查询成功', userInfo: user };
            }
        })
    } catch (error) {
        console.log(error);
        ctx.status = 500;
        ctx.body = { error: '查询异常' };
    }
}

/**
 * 搜索用户
 */
async function searchUsers(ctx) {
    try {
        const { keyword } = ctx.request.body;
        if (!keyword) {
            ctx.status = 400;
            ctx.body = { code: 400, error: '搜索关键字不能为空' };
            return;
        }
        await authMiddleware(ctx, async () => {
            const sql = `
                SELECT * FROM user_list
                WHERE username LIKE ? OR email LIKE ?
            `;
            const params = [`%${keyword}%`, `%${keyword}%`];

            const [users] = await db.query(sql, params);

            ctx.status = 200;
            ctx.body = { code: 200, data: users };
        });
    } catch (error) {
        console.log(error);
        ctx.status = 500;
        ctx.body = { code: 500, error: '搜索用户异常' };
    }
}


module.exports = { register, login, checkUserExists, getUserInfo, logout, searchUsers };
