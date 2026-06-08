import userModel from './models/user.model.js';

// DAO: única capa que conoce y habla con el modelo de Mongoose.
export default class UserDao {
    getAll() {
        return userModel.find({}, { password: 0 }).lean();
    }

    getById(id) {
        return userModel.findById(id).lean();
    }

    getByEmail(email) {
        return userModel.findOne({ email });
    }

    create(user) {
        return userModel.create(user);
    }

    update(id, data) {
        return userModel.findByIdAndUpdate(id, data, { new: true });
    }

    delete(id) {
        return userModel.findByIdAndDelete(id);
    }
}
