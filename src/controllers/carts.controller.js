import { cartRepository } from '../repositories/index.js';

export const getCart = async (req, res) => {
    try {
        const cart = await cartRepository.getById(req.params.cid);
        res.json({ status: 'success', cart });
    } catch (error) {
        res.status(404).json({ status: 'error', message: error.message });
    }
};

export const addProductToCart = async (req, res) => {
    try {
        // El carrito sobre el que se opera es el del usuario autenticado.
        const cartId = req.user.cart;
        const { pid } = req.params;
        const quantity = Number(req.body.quantity) || 1;
        const cart = await cartRepository.addProduct(cartId, pid, quantity);
        res.json({ status: 'success', message: 'Producto agregado al carrito', cart });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

export const removeProductFromCart = async (req, res) => {
    try {
        const cartId = req.user.cart;
        const cart = await cartRepository.removeProduct(cartId, req.params.pid);
        res.json({ status: 'success', message: 'Producto eliminado del carrito', cart });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

export const clearCart = async (req, res) => {
    try {
        const cartId = req.user.cart;
        const cart = await cartRepository.clear(cartId);
        res.json({ status: 'success', message: 'Carrito vaciado', cart });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

// Finalizar compra: verifica stock, genera ticket y maneja compras incompletas.
export const purchaseCart = async (req, res) => {
    try {
        const cartId = req.user.cart;
        const { ticket, purchased, notPurchased } = await cartRepository.purchase(cartId, req.user.email);

        if (!ticket) {
            // Ningún producto tenía stock suficiente.
            return res.status(409).json({
                status: 'error',
                message: 'No se pudo comprar ningún producto por falta de stock',
                notPurchased
            });
        }

        res.json({
            status: 'success',
            message: notPurchased.length
                ? 'Compra realizada parcialmente. Algunos productos quedaron en el carrito por falta de stock.'
                : 'Compra realizada con éxito',
            ticket,
            purchased,
            notPurchased
        });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};
