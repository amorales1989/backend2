import productModel from './models/product.model.js';

export default class ProductDao {
    getAll() {
        return productModel.find().lean();
    }

    getById(id) {
        return productModel.findById(id);
    }

    getByCode(code) {
        return productModel.findOne({ code });
    }

    create(product) {
        return productModel.create(product);
    }

    update(id, data) {
        return productModel.findByIdAndUpdate(id, data, { new: true });
    }

    delete(id) {
        return productModel.findByIdAndDelete(id);
    }
}
