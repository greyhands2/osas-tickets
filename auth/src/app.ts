import express, {Express} from 'express'
import 'express-async-errors'

import cookieSession from 'cookie-session';
import { currentUserRouter } from './routes/currentUser';
import { signInRouter } from './routes/signIn';
import { signOutRouter } from './routes/signOut';
import { signUpRouter } from './routes/signUp';
import {json} from 'body-parser'

import { errorHandler, NotFoundError } from '@osas-tickets/common';

const app: Express = express();
//to make sure that express is receiving traffic from an nginx proxy
app.set('trust proxy', true);

app.use(json());
app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test' ? true : false
}))
app.use(currentUserRouter)
app.use(signInRouter)
app.use(signOutRouter)
app.use(signUpRouter)


app.all('*', ()=>{
     throw new NotFoundError();
})
app.use(errorHandler);

export {app};