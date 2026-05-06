import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import 'dotenv/config';

import initializePassport from './config/passport.config.js';
import sessionsRouter from './routes/sessions.router.js';

const app = express();
const PORT = process.env.PORT || 8080;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/ecommerce';

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Passport
initializePassport();
app.use(passport.initialize());

// Rutas
app.use('/api/sessions', sessionsRouter);

app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'API Ecommerce con autenticación JWT',
        endpoints: {
            register: 'POST /api/sessions/register',
            login: 'POST /api/sessions/login',
            current: 'GET /api/sessions/current',
            logout: 'POST /api/sessions/logout'
        }
    });
});

// Conexión a MongoDB y arranque del server
mongoose.connect(MONGO_URL)
    .then(() => {
        console.log('Conectado a MongoDB');
        app.listen(PORT, () => {
            console.log(`Servidor escuchando en http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Error al conectar a MongoDB:', err);
    });
