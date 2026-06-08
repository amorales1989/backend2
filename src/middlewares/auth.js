import passport from 'passport';

// Middleware que valida el JWT con la estrategia indicada (ej: "current").
// Deja el usuario autenticado en req.user.
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

// Middleware de autorización por rol. Trabaja junto a la estrategia "current":
// se ejecuta DESPUÉS de passportCall('current'), usando req.user.
// Acepta uno o varios roles permitidos.
export const authorization = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ status: 'error', message: 'Usuario no autenticado' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tiene permisos suficientes para acceder a este recurso'
            });
        }
        next();
    };
};
