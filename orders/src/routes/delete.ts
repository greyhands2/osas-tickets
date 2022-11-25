import express, {Request, Response, Router} from 'express'
import {requireAuth, NotFoundError, NotAuthorizedError} from '@osas-tickets/common'
import { Order, OrderStatus } from '../models/orders';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { natsWrapper } from '../nats-wrapper';
const router: Router = express.Router();


router.delete('/api/orders/:orderId', requireAuth,  async(req: Request, res: Response) => {
    const {orderId} = req.params;

    const order = await Order.findById(orderId).populate('ticket');


    if(!order){
        throw new NotFoundError()
    }


    if(order.userId !== req.currentUser!.id){
        throw new NotAuthorizedError()
    }

    order.status = OrderStatus.Cancelled;

    await order.save();

    //publish an event saying this was cancelled
    new OrderCancelledPublisher(natsWrapper.client).publish({
        id: order.id,
        version: order.version,
        ticket:{
            id: order.ticket.id

        }
    })
    res.status(204).send(order);
})


export {router as deleteOrderRouter};