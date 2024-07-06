const Router = require('koa-router');
const authController = require('../controllers/authController');
const router = new Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/checkUserExists', authController.checkUserExists);
router.post('/getUserInfo', authController.getUserInfo);
router.post('/logout', authController.logout);


module.exports = router.routes();
