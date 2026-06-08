import { Router } from 'express';
import passport from 'passport';
import { passportCall, authorization } from '../middlewares/auth.js';
import {
    register,
    login,
    logout,
    current,
    forgotPassword,
    resetPasswordForm,
    resetPassword,
    getUsers,
    getUserById,
    updateUser,
    deleteUser
} from '../controllers/sessions.controller.js';

const router = Router();

// REGISTER
router.post('/register',
    passport.authenticate('register', { session: false, failureRedirect: '/api/sessions/failregister' }),
    register
);

router.get('/failregister', (req, res) => {
    res.status(400).json({ status: 'error', message: 'Fallo en el registro' });
});

// LOGIN — genera token JWT y lo envía como cookie
router.post('/login',
    passport.authenticate('login', { session: false, failureRedirect: '/api/sessions/faillogin' }),
    login
);

router.get('/faillogin', (req, res) => {
    res.status(401).json({ status: 'error', message: 'Fallo en el login' });
});

// LOGOUT
router.post('/logout', logout);

// CURRENT — valida JWT y devuelve un DTO sin datos sensibles
router.get('/current', passportCall('current'), current);

// RECUPERACIÓN DE CONTRASEÑA
router.post('/forgot-password', forgotPassword);
router.get('/reset-password', resetPasswordForm);
router.post('/reset-password', resetPassword);

// CRUD de usuarios (solo admin)
router.get('/users', passportCall('current'), authorization('admin'), getUsers);
router.get('/users/:uid', passportCall('current'), authorization('admin'), getUserById);
router.put('/users/:uid', passportCall('current'), authorization('admin'), updateUser);
router.delete('/users/:uid', passportCall('current'), authorization('admin'), deleteUser);

export default router;
