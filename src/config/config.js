import 'dotenv/config';

// Configuración centralizada de variables de entorno.
// Un único punto de acceso a las variables, con valores por defecto.
const config = {
    port: process.env.PORT || 8080,
    mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017/ecommerce',
    jwt: {
        privateKey: process.env.JWT_SECRET || 'claveSecretaPorDefecto',
        cookieName: process.env.JWT_COOKIE_NAME || 'jwtCookieToken',
        resetKey: process.env.JWT_RESET_SECRET || 'claveResetPorDefecto'
    },
    // Capa de persistencia activa (por si en el futuro se agrega memory/fileSystem)
    persistence: process.env.PERSISTENCE || 'mongo',
    mail: {
        service: process.env.MAIL_SERVICE || 'gmail',
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    },
    // URL base usada para armar los links de los correos (ej: reset password)
    baseUrl: process.env.BASE_URL || 'http://localhost:8080'
};

export default config;
