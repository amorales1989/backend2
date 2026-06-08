import nodemailer from 'nodemailer';
import config from '../config/config.js';

// Transporter de nodemailer configurado vía variables de entorno (Gmail).
const transporter = nodemailer.createTransport({
    service: config.mail.service,
    auth: {
        user: config.mail.user,
        pass: config.mail.pass
    }
});

// Envía el correo de recuperación de contraseña con un botón hacia el link de reset.
export const sendResetPasswordEmail = async (to, resetToken) => {
    const resetUrl = `${config.baseUrl}/api/sessions/reset-password?token=${resetToken}`;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
            <h2>Recuperación de contraseña</h2>
            <p>Recibimos una solicitud para restablecer tu contraseña.</p>
            <p>Hacé clic en el botón para crear una nueva. Este enlace expira en <b>1 hora</b>.</p>
            <p style="text-align: center; margin: 32px 0;">
                <a href="${resetUrl}"
                   style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;
                          text-decoration:none;font-weight:bold;">
                    Restablecer contraseña
                </a>
            </p>
            <p style="color:#666;font-size:13px;">
                Si no solicitaste este cambio, podés ignorar este correo.
            </p>
        </div>
    `;

    return transporter.sendMail({
        from: `"Ecommerce" <${config.mail.user}>`,
        to,
        subject: 'Recuperación de contraseña',
        html
    });
};

export default transporter;
