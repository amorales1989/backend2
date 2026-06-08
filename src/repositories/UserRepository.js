import CurrentUserDTO from '../dto/UserDTO.js';
import { createHash, isValidPassword } from '../utils/utils.js';

// Repository: orquesta la lógica de negocio de usuarios apoyándose en el DAO.
// La ruta/controlador nunca toca el DAO directamente.
export default class UserRepository {
    constructor(dao) {
        this.dao = dao;
    }

    getAll() {
        return this.dao.getAll();
    }

    getById(id) {
        return this.dao.getById(id);
    }

    getByEmail(email) {
        return this.dao.getByEmail(email);
    }

    create(user) {
        return this.dao.create(user);
    }

    update(id, data) {
        return this.dao.update(id, data);
    }

    delete(id) {
        return this.dao.delete(id);
    }

    // Devuelve el DTO seguro para /current (sin datos sensibles).
    getCurrentDTO(user) {
        return new CurrentUserDTO(user);
    }

    // Actualiza la password validando que NO sea igual a la anterior.
    async resetPassword(email, newPassword) {
        const user = await this.dao.getByEmail(email);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        if (isValidPassword(user, newPassword)) {
            throw new Error('La nueva contraseña no puede ser igual a la anterior');
        }
        user.password = createHash(newPassword);
        await user.save();
        return user;
    }
}
