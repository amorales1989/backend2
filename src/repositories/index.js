// Factory / punto único de instanciación de la capa de persistencia.
// Aquí se conectan los DAOs con los Repositories (inyección de dependencias).
// El resto de la app importa los repositories desde acá y nunca instancia DAOs.
import UserDao from '../dao/UserDao.js';
import ProductDao from '../dao/ProductDao.js';
import CartDao from '../dao/CartDao.js';
import TicketDao from '../dao/TicketDao.js';

import UserRepository from './UserRepository.js';
import ProductRepository from './ProductRepository.js';
import CartRepository from './CartRepository.js';
import TicketRepository from './TicketRepository.js';

const userDao = new UserDao();
const productDao = new ProductDao();
const cartDao = new CartDao();
const ticketDao = new TicketDao();

export const userRepository = new UserRepository(userDao);
export const productRepository = new ProductRepository(productDao);
export const cartRepository = new CartRepository(cartDao, productDao, ticketDao);
export const ticketRepository = new TicketRepository(ticketDao);
