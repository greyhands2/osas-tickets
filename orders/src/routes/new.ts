import express, {Request, Response, Router} from 'express'
import mongoose from 'mongoose';
import { requireAuth, validateRequest, NotFoundError, OrderStatus, BadRequestError } from '@osas-tickets/common';
import { body } from 'express-validator';
import { Ticket } from '../models/tickets';
import { Order } from '../models/orders'
import { natsWrapper } from '../nats-wrapper';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
const router: Router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 15 * 60;
router.post('/api/orders',requireAuth, [
    body('ticketId')
        .not()
        .isEmpty()
        .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
        .withMessage('TicketId must be provided')
], validateRequest, async(req: Request, res: Response) => {
    const {ticketId} = req.body;

    //find the ticket the user is trying to order in the database
const ticket = await Ticket.findById(ticketId);
if(!ticket) throw new NotFoundError();
    //make sure that this ticket is not already reserved
    const isReserved = await ticket.isReserved();

    if(isReserved) {
        throw new BadRequestError('Ticket is already reserved');

    }

    //calculate an expiration date for this order
    const expiration = new Date();
    //set expiration to 15mins
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);


    //build the order and save it to the database

    const order = Order.build({userId: req.currentUser!.id, status: OrderStatus.Created, expiresAt: expiration, ticket});

    await order.save();
    //publish an event saying that an order was created
    new OrderCreatedPublisher(natsWrapper.client).publish({
       id: order.id,
       version: order.version,
       status: order.status,
       userId: order.userId,
       expiresAt: order.expiresAt.toISOString(),
       ticket: {
        id: ticket.id,
        price: ticket.price
       }
    })

    res.status(201).send(order);
})


export {router as newOrderRouter};