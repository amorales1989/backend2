import { Router } from 'express';
import { passportCall, authorization } from '../middlewares/auth.js';
import {
    getCart,
    addProductToCart,
    removeProductFromCart,
    clearCart,
    purchaseCart
} from '../controllers/carts.controller.js';

const router = Router();

// Ver un carrito por id (usuario autenticado)
router.get('/:cid', passportCall('current'), getCart);

// SOLO el usuario (role 'user') puede operar sobre su carrito.
// El carrito afectado siempre es el del usuario autenticado (req.user.cart).
router.post('/products/:pid', passportCall('current'), authorization('user'), addProductToCart);
router.delete('/products/:pid', passportCall('current'), authorization('user'), removeProductFromCart);
router.delete('/', passportCall('current'), authorization('user'), clearCart);

// Finalizar compra → genera ticket y verifica stock
router.post('/purchase', passportCall('current'), authorization('user'), purchaseCart);

export default router;
