import { Router } from 'express';
import passport from 'passport';
import userModel from '../dao/models/user.model.js';
import { generateToken } from '../utils/utils.js';
import { passportCall } from '../middlewares/auth.js';

const router = Router();

const COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'jwtCookieToken';

// REGISTER
router.post('/register',
    passport.authenticate('register', { session: false, failureRedirect: '/api/sessions/failregister' }),
    async (req, res) => {
        res.status(201).json({
            status: 'success',
            message: 'Usuario registrado correctamente',
            user: {
                id: req.user._id,
                first_name: req.user.first_name,
                last_name: req.user.last_name,
                email: req.user.email,
                role: req.user.role
            }
        });
    }
);

router.get('/failregister', (req, res) => {
    res.status(400).json({ status: 'error', message: 'Fallo en el registro' });
});

// LOGIN — genera token JWT y lo envía como cookie
router.post('/login',
    passport.authenticate('login', { session: false, failureRedirect: '/api/sessions/faillogin' }),
    async (req, res) => {
        if (!req.user) {
            return res.status(401).json({ status: 'error', message: 'Credenciales inválidas' });
        }

        const tokenUser = {
            id: req.user._id,
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            email: req.user.email,
            age: req.user.age,
            role: req.user.role,
            cart: req.user.cart
        };

        const token = generateToken(tokenUser);

        res.cookie(COOKIE_NAME, token, {
            maxAge: 60 * 60 * 1000 * 24, // 24 hs
            httpOnly: true
        }).json({
            status: 'success',
            message: 'Login exitoso',
            token,
            user: tokenUser
        });
    }
);

router.get('/faillogin', (req, res) => {
    res.status(401).json({ status: 'error', message: 'Fallo en el login' });
});

// LOGOUT
router.post('/logout', (req, res) => {
    res.clearCookie(COOKIE_NAME).json({ status: 'success', message: 'Logout exitoso' });
});

// CURRENT — valida JWT y devuelve datos del usuario
router.get('/current', passportCall('current'), (req, res) => {
    res.json({
        status: 'success',
        message: 'Usuario autenticado',
        user: req.user
    });
});

// CRUD básico de usuarios (admin)
router.get('/users', passportCall('current'), async (req, res) => {
    const users = await userModel.find({}, { password: 0 }).lean();
    res.json({ status: 'success', users });
});

router.get('/users/:uid', passportCall('current'), async (req, res) => {
    try {
        const user = await userModel.findById(req.params.uid, { password: 0 }).lean();
        if (!user) return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
        res.json({ status: 'success', user });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

router.put('/users/:uid', passportCall('current'), async (req, res) => {
    try {
        const { password, ...rest } = req.body; // evitar update directo de password
        const updated = await userModel.findByIdAndUpdate(req.params.uid, rest, { new: true });
        if (!updated) return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
        res.json({ status: 'success', user: updated });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

router.delete('/users/:uid', passportCall('current'), async (req, res) => {
    try {
        const deleted = await userModel.findByIdAndDelete(req.params.uid);
        if (!deleted) return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
        res.json({ status: 'success', message: 'Usuario eliminado' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

export default router;
