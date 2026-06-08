// DTO para la ruta /current: expone SOLO información no sensible del usuario.
// Nunca incluye password ni otros datos internos.
export default class CurrentUserDTO {
    constructor(user) {
        this.id = user._id || user.id;
        this.full_name = `${user.first_name} ${user.last_name}`;
        this.email = user.email;
        this.role = user.role;
        this.cart = user.cart;
    }
}
