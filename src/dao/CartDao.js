import cartModel from './models/cart.model.js';

export default class CartDao {
    getById(id) {
        return cartModel.findById(id).populate('products.product');
    }

    create() {
        return cartModel.create({ products: [] });
    }

    update(id, data) {
        return cartModel.findByIdAndUpdate(id, data, { new: true });
    }

    // Guarda un documento cart ya modificado en memoria.
    save(cart) {
        return cart.save();
    }
}
