const express = require('express');
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getCategories);

router.use(protect);
router.use(authorize('admin'));

router.post('/', createCategory);
router.route('/:id').put(updateCategory).delete(deleteCategory);

module.exports = router;
