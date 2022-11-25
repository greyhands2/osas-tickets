import express, {Express} from 'express'
import 'express-async-errors'

import cookieSession from 'cookie-session';


import {json} from 'body-parser'

import { errorHandler, NotFoundError, currentUser } from '@osas-tickets/common';
import { createTicketRouter } from './routes/new';
import { showTickerRouter } from './routes/show';
import { showAllTicketsRouter } from './routes';

import { updateTicketRouter } from './routes/update';
const app: Express = express();
//to make sure that express is receiving traffic from an nginx proxy
app.set('trust proxy', true);

app.use(json());
app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test' ? true : false
}))

app.use(currentUser)
app.use(createTicketRouter);
app.use(showTickerRouter);
app.use(showAllTicketsRouter);
app.use(updateTicketRouter);
app.all('*', ()=>{
     throw new NotFoundError();
})
app.use(errorHandler);

export {app};