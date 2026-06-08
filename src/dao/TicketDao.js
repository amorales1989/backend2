import ticketModel from './models/ticket.model.js';

export default class TicketDao {
    create(ticket) {
        return ticketModel.create(ticket);
    }

    getByCode(code) {
        return ticketModel.findOne({ code }).lean();
    }
}
