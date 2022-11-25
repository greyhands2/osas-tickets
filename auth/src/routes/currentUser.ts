import express, {Router, Request, Response} from 'express'

import { currentUser } from '@osas-tickets/common';

const router: Router = express.Router();

router.get('/api/users/currentUser', currentUser, (req: Request, res: Response) => {
    //if(!req.session || !req.session.jwt)
    res.send({currentUser: req.currentUser || null});
    
    




})



export {router as currentUserRouter};
