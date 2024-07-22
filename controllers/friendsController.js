const db = require('../config/dbConfig');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * 申请添加为好友
 */
async function createFriend(ctx) {
    try {
        const { user_id, friend_id, application_text } = ctx.request.body;
        if (!user_id || !friend_id) {
            ctx.status = 401;
            ctx.body = { code: 401, error: 'user_id 和 friend_id 不能为空' };
            return;
        }

        await authMiddleware(ctx, async () => {
            const sql = 'INSERT INTO friends (user_id, friend_id, application_text,friend_status, new_date) VALUES (?, ?, ?, ?, ?)';
            const params = [user_id, friend_id, application_text, 1];

            const [result] = await db.query(sql, params);

            if (result.affectedRows > 0) {
                ctx.status = 200;
                ctx.body = { code: 200, message: '好友请求已发送' };
            } else {
                ctx.status = 500;
                ctx.body = { code: 500, error: '创建好友请求失败' };
            }
        });
    } catch (error) {
        console.log(error);
        ctx.status = 500;
        ctx.body = { code: 500, error: '创建好友请求异常' };
    }
}

/**
 * 获取好友列表
 */
async function getFriends(ctx) {
    try {
        const { user_id } = ctx.query;
        if (!user_id) {
            ctx.status = 401;
            ctx.body = { code: 401, error: 'user_id 不能为空' };
            return;
        }

        await authMiddleware(ctx, async () => {
            const sql = 'SELECT * FROM friend_list WHERE user_id = ? AND friend_status = ?';
            const params = [user_id, 0];

            const [friends] = await db.query(sql, params);

            ctx.status = 200;
            ctx.body = { code: 200, data: friends };
        });
    } catch (error) {
        console.log(error);
        ctx.status = 500;
        ctx.body = { code: 500, error: '获取好友列表异常' };
    }
}

/**
 * 接受好友请求
 */
async function acceptFriend(ctx) {
    try {
        const { user_id, friend_id } = ctx.request.body;
        if (!user_id || !friend_id) {
            ctx.status = 401;
            ctx.body = { code: 401, error: 'user_id 和 friend_id 不能为空' };
            return;
        }

        await authMiddleware(ctx, async () => {
            const sql = 'UPDATE friend_list SET friend_status = ? WHERE user_id = ? AND friend_id = ?';
            const params = [0, user_id, friend_id];

            const [result] = await db.query(sql, params);

            if (result.affectedRows > 0) {
                ctx.status = 200;
                ctx.body = { code: 200, message: '好友请求已接受' };
            } else {
                ctx.status = 500;
                ctx.body = { code: 500, error: '好友请求接受失败' };
            }
        });
    } catch (error) {
        console.log(error);
        ctx.status = 500;
        ctx.body = { code: 500, error: '接受好友请求异常' };
    }
}

/**
 * 拒绝好友请求
 */
async function rejectFriend(ctx) {
    try {
        const { user_id, friend_id } = ctx.request.body;
        if (!user_id || !friend_id) {
            ctx.status = 401;
            ctx.body = { code: 401, error: 'user_id 和 friend_id 不能为空' };
            return;
        }

        await authMiddleware(ctx, async () => {
            const sql = 'UPDATE friend_list SET friend_status = ? WHERE user_id = ? AND friend_id = ?';
            const params = [3, user_id, friend_id];

            const [result] = await db.query(sql, params);

            if (result.affectedRows > 0) {
                ctx.status = 200;
                ctx.body = { code: 200, message: '好友请求已拒绝' };
            } else {
                ctx.status = 500;
                ctx.body = { code: 500, error: '好友请求拒绝失败' };
            }
        });
    } catch (error) {
        console.log(error);
        ctx.status = 500;
        ctx.body = { code: 500, error: '拒绝好友请求异常' };
    }
}

module.exports = { createFriend, getFriends, acceptFriend, rejectFriend };