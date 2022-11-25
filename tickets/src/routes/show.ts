import express, {Request, Response, Router} from 'express'

import { NotFoundError} from '@osas-tickets/common'
import { Ticket } from '../models/ticket';
const router: Router = express.Router();


router.get('/api/tickets/:id', async(req: Request, res: Response)=>{
    const ticket = await Ticket.findById(req.params.id);

    if(!ticket) {
        throw new NotFoundError();
    }
    //not providing a status code defaults to 200
    res.send(ticket);

})


export {router as showTickerRouter};