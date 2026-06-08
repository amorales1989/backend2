// Script de carga inicial: crea un usuario admin, un usuario común y productos de ejemplo.
// Uso: npm run seed
import mongoose from 'mongoose';
import config from './config/config.js';
import { userRepository, productRepository, cartRepository } from './repositories/index.js';
import { createHash } from './utils/utils.js';

const PRODUCTS = [
    { title: 'Teclado mecánico', description: 'Switches red, RGB', code: 'TEC-001', price: 25000, stock: 10, category: 'Periféricos' },
    { title: 'Mouse inalámbrico', description: '6 botones, 16000 DPI', code: 'MOU-001', price: 18000, stock: 15, category: 'Periféricos' },
    { title: 'Monitor 24" 144Hz', description: 'Full HD IPS', code: 'MON-001', price: 180000, stock: 5, category: 'Monitores' },
    { title: 'Auriculares gamer', description: 'Sonido 7.1, micrófono', code: 'AUR-001', price: 32000, stock: 0, category: 'Audio' }, // sin stock a propósito
    { title: 'Webcam 1080p', description: 'Autofoco, 30fps', code: 'WEB-001', price: 22000, stock: 8, category: 'Periféricos' }
];

const USERS = [
    { first_name: 'Admin', last_name: 'Root', email: 'admin@mail.com', age: 30, password: 'admin1234', role: 'admin' },
    { first_name: 'Juan', last_name: 'Pérez', email: 'user@mail.com', age: 25, password: 'user1234', role: 'user' }
];

const seed = async () => {
    try {
        await mongoose.connect(config.mongoUrl);
        console.log('Conectado a MongoDB');

        // Productos
        for (const p of PRODUCTS) {
            const existing = await productRepository.getAll();
            if (!existing.find(e => e.code === p.code)) {
                await productRepository.create(p);
                console.log(`Producto creado: ${p.title}`);
            } else {
                console.log(`Producto ya existe: ${p.title}`);
            }
        }

        // Usuarios (cada uno con su carrito)
        for (const u of USERS) {
            const existing = await userRepository.getByEmail(u.email);
            if (existing) {
                console.log(`Usuario ya existe: ${u.email}`);
                continue;
            }
            const cart = await cartRepository.create();
            await userRepository.create({
                ...u,
                password: createHash(u.password),
                cart: cart._id
            });
            console.log(`Usuario creado: ${u.email} (${u.role}) — password: ${u.password}`);
        }

        console.log('\nSeed completado.');
    } catch (error) {
        console.error('Error en el seed:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

seed();
