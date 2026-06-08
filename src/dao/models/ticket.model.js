import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const ticketCollection = 'tickets';

const ticketSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        // Código único autogenerado
        default: () => randomUUID()
    },
    purchase_datetime: {
        type: Date,
        default: Date.now
    },
    amount: {
        type: Number,
        required: true
    },
    purchaser: {
        // email del usuario que realizó la compra
        type: String,
        required: true
    }
});

const ticketModel = mongoose.model(ticketCollection, ticketSchema);

export default ticketModel;
