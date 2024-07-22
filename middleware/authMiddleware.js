const { verifyToken } = require('../utils/jwtUtils');
let blacklistedTokens = new Set();// 在退出登录时，将令牌加入黑名单

/**
 * 认证中间件:验证用户身份是否合法
 *
 * @param ctx Koa 上下文对象
 * @param next 下一个中间件函数
 * @returns 返回一个 Promise，当所有中间件处理完成后解析
 */
async function authMiddleware(ctx, next) {
  try {
    const authHeader = ctx.headers.authorization;
    console.log(ctx.request);
    const { user_id } = ctx.request.body;

    // 1.检查授权头部是否存在
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ctx.status = 401;
      ctx.body = { code: 401, error: 'token无效,请重新登录' };
      return;
    }

    // 2.提取JWT令牌
    const token = authHeader.split(' ')[1];
    let decodedToken = verifyToken(token);

    // 3.检查JWT令牌是否有效
    if (blacklistedTokens.has(token)) {
      ctx.status = 401;
      ctx.body = { code: 401, error: 'token无效,请重新登录' };
      return;
    }

    // 4.检查JWT令牌中的用户名与请求的用户名是否匹配
    // if (decodedToken.user_id !== user_id) {
    //   ctx.status = 401;
    //   ctx.body = { code: 401, error: '账户异常,需重新登录' };
    //   return;
    // }

    ctx.state.user = decodedToken;
    await next();
    
  } catch (error) {
    console.log(error);
    ctx.status = 401;
    ctx.body = { code: 401, error: 'token无效,请重新登录' };
  }
}

/**
 * 退出登录时，将令牌加入黑名单
 * 
 */
async function logoutMiddleware(ctx) {
  const authHeader = ctx.headers.authorization;
  const token = authHeader.split(' ')[1];
  blacklistedTokens.add(token);
}

module.exports = { authMiddleware, logoutMiddleware };
