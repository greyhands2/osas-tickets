import express, {Request, Response, Router} from 'express'
import { natsWrapper } from '../nats-wrapper';
import {body} from 'express-validator'
import {requireAuth, validateRequest} from '@osas-tickets/common'
import { Ticket } from '../models/ticket';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher';
const router: Router = express.Router();
interface Payload {
    title: string;
    price:  number;
}
router.post('/api/tickets', requireAuth, [
    body('title')
    .not()
    .isEmpty()
    .withMessage('Title is required'),
    body('price')
    .isFloat({gt: 0})    
    .withMessage('Price must be greater than zero')
], validateRequest, async(req: Request, res: Response) => {

    const {title, price}: Payload = req.body;

    const ticket = Ticket.build({
        title, price, userId: req.currentUser!.id
    })
     await ticket.save();

//we dont call a getter function in typescript with parenthesis i.e natsWrapper.client not natsWrapper.client()
    new TicketCreatedPublisher(natsWrapper.client).publish({
        id: ticket.id,
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId,
        version: ticket.version
    });

    res.status(201).send(ticket);
})


export {router as createTicketRouter};