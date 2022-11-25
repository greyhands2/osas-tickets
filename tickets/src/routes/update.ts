import express, {Request, Response, Router} from 'express'
import {body} from 'express-validator'
import {requireAuth, validateRequest, NotAuthorizedError, NotFoundError, BadRequestError} from '@osas-tickets/common'
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { natsWrapper } from '../nats-wrapper';
import { Ticket } from '../models/ticket';

const router: Router = express.Router();
interface Payload {
    title?: string;
    price?:  number;
}

router.put('/api/tickets/:id', requireAuth, [
    body('title')
    .not()
    .isEmpty()
    .withMessage('Title is required'),

    body('price')
    .isFloat({ gt: 0 })
    .withMessage('Price must be provided and greater than 0 ')

], validateRequest,  async(req: Request, res: Response)=>{
    const {price, title}: Payload = req.body;

    const ticket = await Ticket.findById(req.params.id);

    if(!ticket) {
        throw new NotFoundError();
    }

    if( ticket.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }
    //the presence of an order Id means the ticket is reserved so the user cannot book it
    if(ticket.orderId){
        throw new BadRequestError('Cannot edit a reserved ticket')
    }
    ticket.set({
        title,
        price 
    })

    await ticket.save();

    new TicketUpdatedPublisher(natsWrapper.client).publish({
        id: ticket.id,
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId,
        version: ticket.version

    })
    res.send(ticket);
})

export {router as updateTicketRouter}