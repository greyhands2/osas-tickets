import express, {Request, Response, Router} from 'express'

import {requireAuth} from '@osas-tickets/common'
import { Order } from '../models/orders';
const router: Router = express.Router();


router.get('/api/orders', requireAuth,  async(req: Request, res: Response) => {
    const orders = await Order.find({
        userId: req.currentUser!.id
    }).populate('ticket');

    res.send(orders);
})


export {router as indexOrderRouter};