import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

// Encriptación de password con bcrypt.hashSync
export const createHash = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

// Validación de password
export const isValidPassword = (user, password) => bcrypt.compareSync(password, user.password);

// Generación de token JWT
export const PRIVATE_KEY = process.env.JWT_SECRET || 'claveSecretaPorDefecto';

export const generateToken = (user) => {
    const token = jwt.sign({ user }, PRIVATE_KEY, { expiresIn: '24h' });
    return token;
};

// Extractor del token desde cookie
export const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies[process.env.JWT_COOKIE_NAME || 'jwtCookieToken'];
    }
    return token;
};
