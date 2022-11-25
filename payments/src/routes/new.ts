import express, {Request, Response, Router} from 'express'
import { natsWrapper } from '../nats-wrapper';
import {body} from 'express-validator'
import {requireAuth, validateRequest, BadRequestError, NotFoundError, NotAuthorizedError, OrderStatus} from '@osas-tickets/common'
import { Order } from '../models/order';
import { stripe } from '../stripe';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
const router: Router = express.Router();
interface Payload {
    title: string;
    price:  number;
};

router.post('/api/payment', requireAuth, [
    body('token')
    .not()
    .isEmpty()
    .withMessage('Token is required'),
    body('orderId')
    .not()
    .isEmpty()   
    .withMessage('Orderid is required')
], validateRequest, async(req: Request, res: Response) => {

    const {token, orderId}: Payload = req.body;

    const order = await Order.findById(orderId);

    if(!order) {
        throw new NotFoundError();
    }


    if(order.userId !== req.currentUser!.id){
        throw new NotAuthorizedError();
    }


    if(order.status === OrderStatus.Cancelled){
        throw new BadRequestError('Cannot pay for a cancelled order')
    }


    const charge = await stripe.charges.create({
        currency: 'usd',
        amount: order.price * 100,
        source: token
    });

    const payment = Payment.build({
        orderId,
        stripeId: charge.id
    })


    await payment.save();

   await new PaymentCreatedPublisher(natsWrapper.client).publish({
        id: payment.id,
        orderId: payment.orderId,
        stripeId: payment.stripeId
    });

    res.status(201).send({id: payment.id});
});


export {router as createChargeRouter};