import express, {Router, Request, Response} from 'express'

import { BadRequestError,validateRequest } from '@osas-tickets/common';
import jwt from 'jsonwebtoken'
import { User } from '../models/user';

import { validateSignUp } from '../middleware/signUp';
const router: Router = express.Router();

router.post('/api/users/signup',validateSignUp, validateRequest, async(req: Request, res: Response) => {
     
    const {email, password}:{email: string; password:string}  = req.body;

   const existingUser = await User.findOne({email});
   if(existingUser){
        throw new BadRequestError('Email in use')
   } 

   const user = User.build({email, password});

   await user.save();


   // generate jwt
   //since we are using microservices and using a k8s cluster we can save the jwt secret as an env var in k8s so it can be accesible to all pods(services) in the cluster using the command:
   //kubectl create secret generic jwt-secret --from-literal=JWT_KEY=asdf13K*

   //use kubectl get secrets to list all secrets in k8s
   const userJWT = jwt.sign({
    id: user.id, 
    email: user.email
   }, process.env.JWT_KEY!);


   //store jwt in session
   req.session = {
    jwt : userJWT
   }

   
   res.status(201).send(user)
});



export {router as signUpRouter};
