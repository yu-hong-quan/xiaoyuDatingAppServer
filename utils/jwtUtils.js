const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_jwt_secret';

/**
 * 生成JWT令牌
 *
 * @param payload 载荷对象，包含要包含在JWT中的声明信息
 * @returns 返回生成的JWT令牌字符串
 */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
}

/**
 * 验证JWT令牌
 *
 * @param token JWT令牌
 * @returns 验证成功返回解析后的JWT对象，验证失败抛出错误
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { generateToken, verifyToken };
