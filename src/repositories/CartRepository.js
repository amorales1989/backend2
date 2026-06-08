import { randomUUID } from 'crypto';

// Repository de carritos: contiene la lógica de negocio de compra.
// Depende de los DAOs de Cart, Product y Ticket (inyección de dependencias).
export default class CartRepository {
    constructor(cartDao, productDao, ticketDao) {
        this.cartDao = cartDao;
        this.productDao = productDao;
        this.ticketDao = ticketDao;
    }

    async getById(id) {
        const cart = await this.cartDao.getById(id);
        if (!cart) throw new Error('Carrito no encontrado');
        return cart;
    }

    create() {
        return this.cartDao.create();
    }

    // Agrega un producto al carrito (o suma cantidad si ya existe).
    async addProduct(cartId, productId, quantity = 1) {
        const cart = await this.cartDao.getById(cartId);
        if (!cart) throw new Error('Carrito no encontrado');

        const product = await this.productDao.getById(productId);
        if (!product) throw new Error('Producto no encontrado');

        const item = cart.products.find(p => p.product._id.equals(productId));
        if (item) {
            item.quantity += quantity;
        } else {
            cart.products.push({ product: productId, quantity });
        }
        await this.cartDao.save(cart);
        return cart;
    }

    async removeProduct(cartId, productId) {
        const cart = await this.cartDao.getById(cartId);
        if (!cart) throw new Error('Carrito no encontrado');
        cart.products = cart.products.filter(p => !p.product._id.equals(productId));
        await this.cartDao.save(cart);
        return cart;
    }

    async clear(cartId) {
        const cart = await this.cartDao.getById(cartId);
        if (!cart) throw new Error('Carrito no encontrado');
        cart.products = [];
        await this.cartDao.save(cart);
        return cart;
    }

    /**
     * Lógica de compra:
     * - Verifica stock de cada producto del carrito.
     * - Los que tienen stock suficiente: descuenta stock y suma al total.
     * - Los que NO tienen stock: quedan en el carrito (compra incompleta).
     * - Genera un Ticket con el total de lo efectivamente comprado.
     * Devuelve { ticket, purchased, notPurchased }.
     */
    async purchase(cartId, purchaserEmail) {
        const cart = await this.cartDao.getById(cartId);
        if (!cart) throw new Error('Carrito no encontrado');
        if (cart.products.length === 0) throw new Error('El carrito está vacío');

        let amount = 0;
        const purchased = [];      // ids de productos comprados
        const notPurchased = [];   // items que no se pudieron comprar (sin stock)

        for (const item of cart.products) {
            const product = item.product; // populado por el DAO
            if (product.stock >= item.quantity) {
                product.stock -= item.quantity;
                await this.productDao.update(product._id, { stock: product.stock });
                amount += product.price * item.quantity;
                purchased.push(product._id);
            } else {
                notPurchased.push({ product: product._id, quantity: item.quantity });
            }
        }

        let ticket = null;
        if (amount > 0) {
            ticket = await this.ticketDao.create({
                code: randomUUID(),
                amount,
                purchaser: purchaserEmail
            });
        }

        // En el carrito quedan SOLO los productos que no se pudieron comprar.
        cart.products = notPurchased;
        await this.cartDao.save(cart);

        return { ticket, purchased, notPurchased };
    }
}
