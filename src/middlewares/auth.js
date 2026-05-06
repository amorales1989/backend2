import passport from 'passport';

// Middleware para validar token JWT con la estrategia "current"
export const passportCall = (strategy) => {
    return async (req, res, next) => {
        passport.authenticate(strategy, { session: false }, (err, user, info) => {
            if (err) return next(err);
            if (!user) {
                return res.status(401).json({
                    status: 'error',
                    message: info?.message || info?.toString() || 'Token inválido o inexistente'
                });
            }
            req.user = user;
            next();
        })(req, res, next);
    };
};

// Middleware de autorización por rol
export const authorization = (role) => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ status: 'error', message: 'Usuario no autenticado' });
        }
        if (req.user.role !== role) {
            return res.status(403).json({ status: 'error', message: 'No tiene permisos suficientes' });
        }
        next();
    };
};
