import express, {Express} from 'express'
import 'express-async-errors'

import cookieSession from 'cookie-session';


import {json} from 'body-parser'

import { errorHandler, NotFoundError, currentUser } from '@osas-tickets/common';
import { deleteOrderRouter } from './routes/delete';
import { showOrderRouter } from './routes/show';

import { newOrderRouter } from './routes/new';

import { indexOrderRouter } from './routes';
const app: Express = express();
//to make sure that express is receiving traffic from an nginx proxy
app.set('trust proxy', true);

app.use(json());
app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test' ? true : false
}))

app.use(currentUser)
app.use(indexOrderRouter);
app.use(showOrderRouter);
app.use(deleteOrderRouter);
app.use(newOrderRouter);
app.all('*', ()=>{
     throw new NotFoundError();
})
app.use(errorHandler);

export {app};