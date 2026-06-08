import { userRepository } from '../repositories/index.js';
import { generateToken, generateResetToken, verifyResetToken } from '../utils/utils.js';
import { sendResetPasswordEmail } from '../utils/mailer.js';
import config from '../config/config.js';

const COOKIE_NAME = config.jwt.cookieName;

export const register = (req, res) => {
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
};

export const login = (req, res) => {
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
};

export const logout = (req, res) => {
    res.clearCookie(COOKIE_NAME).json({ status: 'success', message: 'Logout exitoso' });
};

// /current → devuelve un DTO sin información sensible (sin password).
export const current = (req, res) => {
    const dto = userRepository.getCurrentDTO(req.user);
    res.json({ status: 'success', message: 'Usuario autenticado', user: dto });
};

// Paso 1: solicitar recuperación → envía correo con link que expira en 1 hora.
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ status: 'error', message: 'Email requerido' });

        const user = await userRepository.getByEmail(email);
        // Respuesta genérica para no revelar si el email existe o no.
        if (user) {
            const token = generateResetToken(email);
            await sendResetPasswordEmail(email, token);
        }
        res.json({
            status: 'success',
            message: 'Si el email está registrado, te enviamos un correo para restablecer la contraseña'
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al enviar el correo: ' + error.message });
    }
};

// Paso 2 (GET): formulario HTML para ingresar la nueva contraseña.
export const resetPasswordForm = (req, res) => {
    const { token } = req.query;
    if (!token) {
        return res.status(400).send('Token inválido o ausente');
    }
    try {
        verifyResetToken(token); // valida expiración antes de mostrar el form
    } catch (error) {
        return res.status(400).send(`
            <h2>El enlace expiró o es inválido</h2>
            <p>Solicitá una nueva recuperación de contraseña.</p>
        `);
    }

    res.send(`
        <div style="font-family: Arial, sans-serif; max-width: 380px; margin: 60px auto;">
            <h2>Nueva contraseña</h2>
            <form id="form">
                <input type="password" id="password" placeholder="Nueva contraseña" required
                       style="width:100%;padding:10px;margin:8px 0;box-sizing:border-box;" />
                <button type="submit"
                        style="width:100%;padding:10px;background:#2563eb;color:#fff;border:none;border-radius:6px;cursor:pointer;">
                    Restablecer
                </button>
            </form>
            <p id="msg" style="margin-top:12px;"></p>
            <script>
                document.getElementById('form').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const password = document.getElementById('password').value;
                    const res = await fetch('/api/sessions/reset-password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token: '${token}', password })
                    });
                    const data = await res.json();
                    document.getElementById('msg').textContent = data.message;
                    document.getElementById('msg').style.color = res.ok ? 'green' : 'red';
                });
            </script>
        </div>
    `);
};

// Paso 2 (POST): valida token, impide reutilizar la misma password y actualiza.
export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json({ status: 'error', message: 'Token y contraseña son requeridos' });
        }

        let payload;
        try {
            payload = verifyResetToken(token);
        } catch (error) {
            return res.status(400).json({ status: 'error', message: 'El enlace expiró o es inválido' });
        }

        await userRepository.resetPassword(payload.email, password);
        res.json({ status: 'success', message: 'Contraseña restablecida correctamente' });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

// --- CRUD de usuarios ---
export const getUsers = async (req, res) => {
    const users = await userRepository.getAll();
    res.json({ status: 'success', users });
};

export const getUserById = async (req, res) => {
    try {
        const user = await userRepository.getById(req.params.uid);
        if (!user) return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
        delete user.password;
        res.json({ status: 'success', user });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { password, ...rest } = req.body; // no se actualiza la password por acá
        const updated = await userRepository.update(req.params.uid, rest);
        if (!updated) return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
        res.json({ status: 'success', user: updated });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const deleted = await userRepository.delete(req.params.uid);
        if (!deleted) return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
        res.json({ status: 'success', message: 'Usuario eliminado' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
