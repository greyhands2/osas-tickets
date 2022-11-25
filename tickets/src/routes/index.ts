import express, {Request, Response, Router} from 'express'

import { NotFoundError} from '@osas-tickets/common'
import { Ticket } from '../models/ticket';
const router: Router = express.Router();


router.get('/api/tickets', async(req: Request, res: Response)=>{
    const tickets = await Ticket.find({});
    res.send(tickets);
})



export {router as showAllTicketsRouter}