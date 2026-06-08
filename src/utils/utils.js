import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';

// Encriptación de password con bcrypt.hashSync
export const createHash = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

// Validación de password
export const isValidPassword = (user, password) => bcrypt.compareSync(password, user.password);

// Clave privada para firmar el JWT de sesión
export const PRIVATE_KEY = config.jwt.privateKey;

// Generación de token JWT de sesión
export const generateToken = (user) => {
    return jwt.sign({ user }, PRIVATE_KEY, { expiresIn: '24h' });
};

// Extractor del token desde la cookie
export const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies[config.jwt.cookieName];
    }
    return token;
};

// --- Recuperación de contraseña ---
// Token de reset firmado con clave aparte y expiración de 1 hora.
export const generateResetToken = (email) => {
    return jwt.sign({ email }, config.jwt.resetKey, { expiresIn: '1h' });
};

// Verifica el token de reset. Lanza error si expiró o es inválido.
export const verifyResetToken = (token) => {
    return jwt.verify(token, config.jwt.resetKey);
};
