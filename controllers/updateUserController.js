const db = require('../config/dbConfig');
const fs = require('fs');
const path = require('path');
const uuid = require('uuid').v4;
const { authMiddleware } = require('../middleware/authMiddleware');
const { uploadDir } = require('../config/uploadConfig');

/**
 * 更新用户信息函数
 *
 * @param ctx Koa上下文对象
 * @returns 无返回值，为异步函数
 */
async function updateUserInfo(ctx) {
    try {
        const { user_id, ...updateData } = ctx.request.body;

        if (!user_id) {
            ctx.status = 401;
            ctx.body = { code: 401, error: 'user_id 不能为空' };
            return;
        }

        await authMiddleware(ctx, async () => {
            // 构建更新的SQL语句和参数
            let sql = 'UPDATE user_list SET ';
            let params = [];
            Object.keys(updateData).forEach((key) => {
                if (updateData[key] !== undefined) {
                    sql += `${key} = ?, `;
                    params.push(updateData[key]);
                }
            });

            // 移除末尾的逗号和空格
            sql = sql.slice(0, -2);
            sql += ' WHERE user_id = ?';
            params.push(user_id);

            // 执行更新操作
            const [updateResult] = await db.query(sql, params);
            // affectedRows：受影响行数
            if (updateResult.affectedRows > 0) {
                ctx.status = 200;
                ctx.body = { code: 200, message: '更新成功' };
            } else {
                ctx.status = 401;
                ctx.body = { code: 401, error: '更新失败' };
            }
        })
    } catch (error) {
        console.log(error);
        ctx.status = 500;
        ctx.body = { code: 500, error: '更新异常' };
    }
}

/**
 * 更新用户头像
 *
 * @param ctx Koa上下文对象
 * @returns Promise<void>
 */
async function updateAvatar(ctx) {
    try {
        // 确保上传目录存在
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }

        const { type, user_id } = ctx.request.body;
        console.log(type, user_id);
        const file = ctx.request.files.file;
        console.log(ctx.request.files);
        let filePath = '';
        let fileName = '';

        if (type === 'WEB') {
            // 处理 base64 数据
            const base64Data = ctx.request.body.file;
            const base64Regex = /^data:image\/(\w+);base64,/;
            const matches = base64Data.match(base64Regex);
            const fileType = matches[1]; // 获取文件类型
            const base64Image = base64Data.replace(base64Regex, '');
            const buffer = Buffer.from(base64Image, 'base64');
            fileName = `${uuid()}.${fileType}`;
            filePath = path.join(uploadDir, fileName);
            await fs.promises.writeFile(filePath, buffer);
            console.log('uploading %s -> %s', file.name, buffer);
        } else {
            // 处理临时地址的图片文件
            const reader = fs.createReadStream(file.path);
            fileName = `${uuid()}.${file.type.split('/')[1]}`;
            filePath = path.join(uploadDir, fileName);
            const stream = fs.createWriteStream(filePath);
            reader.pipe(stream);
            console.log('uploading %s -> %s', file.name, stream.path);
        }

        //  更新数据库用户头像路径
        const sql = 'UPDATE user_list SET avatar = ? WHERE user_id = ?';
        const params = [filePath, user_id];
        await db.query(sql, params);
        ctx.status = 200;
        ctx.body = { code: 200, message: '更新成功', imggeUrl: filePath };
    } catch (error) {
        console.log(error);
        ctx.status = 500;
        ctx.body = { code: 500, error: '更新异常' };
    }
}

module.exports = { updateUserInfo, updateAvatar };