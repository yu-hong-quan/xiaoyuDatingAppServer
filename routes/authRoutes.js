const Router = require('koa-router');
const authController = require('../controllers/authController');
const updateUserController = require('../controllers/updateUserController');
const friendsController = require('../controllers/friendsController');
const router = new Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/checkUserExists', authController.checkUserExists);
router.post('/getUserInfo', authController.getUserInfo);
router.post('/logout', authController.logout);
router.post('/searchUsers', authController.searchUsers);
router.post('/updateUserInfo', updateUserController.updateUserInfo);
router.post('/updateAvatar', updateUserController.updateAvatar);
router.post('/createFriend', friendsController.createFriend);
router.post('/getFriends', friendsController.getFriends);
router.post('/acceptFriend', friendsController.acceptFriend);
router.post('/rejectFriend', friendsController.rejectFriend);


module.exports = router.routes();
