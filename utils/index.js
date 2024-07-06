/**
 * 生成唯一随机数字字符串用于用户ID
 *
 * @param minLength 最小长度
 * @param maxLength 最大长度
 * @returns 唯一随机数字字符串
 */
let generatedNumbers = new Set()
function generateUniqueRandomNumber(minLength, maxLength) {
    while (true) {
        let length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
        let randomNumber = '';
        for (let i = 0; i < length; i++) {
            randomNumber += Math.floor(Math.random() * 9) + 1;  // 生成1到9的随机数
        }
        if (!generatedNumbers.has(randomNumber)) {
            generatedNumbers.add(randomNumber);
            return randomNumber;
        }
    }
}

module.exports = {
    generateUniqueRandomNumber
}