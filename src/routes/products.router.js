import { Router } from 'express';
import { passportCall, authorization } from '../middlewares/auth.js';
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} from '../controllers/products.controller.js';

const router = Router();

// Lectura: pública (cualquiera puede ver el catálogo)
router.get('/', getProducts);
router.get('/:pid', getProductById);

// Escritura: SOLO admin (crear, actualizar y eliminar productos)
router.post('/', passportCall('current'), authorization('admin'), createProduct);
router.put('/:pid', passportCall('current'), authorization('admin'), updateProduct);
router.delete('/:pid', passportCall('current'), authorization('admin'), deleteProduct);

export default router;
