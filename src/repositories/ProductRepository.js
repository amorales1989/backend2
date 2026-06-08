export default class ProductRepository {
    constructor(dao) {
        this.dao = dao;
    }

    getAll() {
        return this.dao.getAll();
    }

    async getById(id) {
        const product = await this.dao.getById(id);
        if (!product) throw new Error('Producto no encontrado');
        return product;
    }

    async create(data) {
        const existing = await this.dao.getByCode(data.code);
        if (existing) throw new Error('Ya existe un producto con ese código');
        return this.dao.create(data);
    }

    async update(id, data) {
        const updated = await this.dao.update(id, data);
        if (!updated) throw new Error('Producto no encontrado');
        return updated;
    }

    async delete(id) {
        const deleted = await this.dao.delete(id);
        if (!deleted) throw new Error('Producto no encontrado');
        return deleted;
    }
}
