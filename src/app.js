import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import passport from 'passport';

import config from './config/config.js';
import initializePassport from './config/passport.config.js';
import sessionsRouter from './routes/sessions.router.js';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Passport
initializePassport();
app.use(passport.initialize());

// Rutas
app.use('/api/sessions', sessionsRouter);
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'API Ecommerce con autenticación JWT, roles y compras',
        endpoints: {
            sessions: '/api/sessions',
            products: '/api/products',
            carts: '/api/carts'
        }
    });
});

// Conexión a MongoDB y arranque del server
mongoose.connect(config.mongoUrl)
    .then(() => {
        console.log('Conectado a MongoDB');
        app.listen(config.port, () => {
            console.log(`Servidor escuchando en http://localhost:${config.port}`);
        });
    })
    .catch((err) => {
        console.error('Error al conectar a MongoDB:', err);
    });
