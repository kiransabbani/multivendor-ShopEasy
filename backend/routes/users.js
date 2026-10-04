const express = require('express');
const { getProfile, updateProfile, addAddress, updateAddress, deleteAddress } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/profile').get(getProfile).put(updateProfile);
router.post('/address', addAddress);
router.route('/address/:id').put(updateAddress).delete(deleteAddress);

module.exports = router;
