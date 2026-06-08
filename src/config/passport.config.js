import passport from 'passport';
import local from 'passport-local';
import jwt from 'passport-jwt';
import { userRepository, cartRepository } from '../repositories/index.js';
import { createHash, isValidPassword, PRIVATE_KEY, cookieExtractor } from '../utils/utils.js';

const LocalStrategy = local.Strategy;
const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;

const initializePassport = () => {

    // Estrategia de REGISTRO (local)
    passport.use('register', new LocalStrategy(
        { passReqToCallback: true, usernameField: 'email' },
        async (req, username, password, done) => {
            const { first_name, last_name, email, age } = req.body;
            try {
                const user = await userRepository.getByEmail(username);
                if (user) {
                    console.log('El usuario ya existe');
                    return done(null, false, { message: 'Usuario ya registrado' });
                }

                // Crear carrito vacío para el nuevo usuario
                const newCart = await cartRepository.create();

                const newUser = {
                    first_name,
                    last_name,
                    email,
                    age,
                    password: createHash(password), // bcrypt.hashSync
                    cart: newCart._id,
                    role: 'user'
                };

                const result = await userRepository.create(newUser);
                return done(null, result);
            } catch (error) {
                return done('Error al registrar el usuario: ' + error);
            }
        }
    ));

    // Estrategia de LOGIN (local)
    passport.use('login', new LocalStrategy(
        { usernameField: 'email' },
        async (username, password, done) => {
            try {
                const user = await userRepository.getByEmail(username);
                if (!user) {
                    console.log('Usuario no encontrado');
                    return done(null, false, { message: 'Usuario no encontrado' });
                }
                if (!isValidPassword(user, password)) {
                    return done(null, false, { message: 'Password incorrecto' });
                }
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    ));

    // Estrategia JWT - "current"
    passport.use('current', new JWTStrategy(
        {
            jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
            secretOrKey: PRIVATE_KEY
        },
        async (jwt_payload, done) => {
            try {
                return done(null, jwt_payload.user);
            } catch (error) {
                return done(error);
            }
        }
    ));

    // Serialización (opcional, útil si se usa session)
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await userRepository.getById(id);
            done(null, user);
        } catch (error) {
            done(error);
        }
    });
};

export default initializePassport;
