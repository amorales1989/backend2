import { productRepository } from '../repositories/index.js';

export const getProducts = async (req, res) => {
    const products = await productRepository.getAll();
    res.json({ status: 'success', products });
};

export const getProductById = async (req, res) => {
    try {
        const product = await productRepository.getById(req.params.pid);
        res.json({ status: 'success', product });
    } catch (error) {
        res.status(404).json({ status: 'error', message: error.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        const product = await productRepository.create(req.body);
        res.status(201).json({ status: 'success', product });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const product = await productRepository.update(req.params.pid, req.body);
        res.json({ status: 'success', product });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        await productRepository.delete(req.params.pid);
        res.json({ status: 'success', message: 'Producto eliminado' });
    } catch (error) {
        res.status(404).json({ status: 'error', message: error.message });
    }
};
