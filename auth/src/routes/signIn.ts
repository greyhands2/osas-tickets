import express, {Router, Request, Response} from 'express'
import jwt from 'jsonwebtoken'
import { validateRequest, BadRequestError } from '@osas-tickets/common';

import { Password } from '../utils/password';
import { validateSignIn } from '../middleware/signIn';
import { User } from '../models/user';
const router: Router = express.Router();

router.post('/api/users/signin', validateSignIn, validateRequest,  async(req: Request, res: Response) => {
    


    const {email, password}:{ email: string; password:string } = req.body;

    const existingUser = await User.findOne({email});

    if(!existingUser){
        throw new BadRequestError('Invalid Credentials');
    }

    const passwordsMatch: boolean = await Password.compare(existingUser.password, password);


    if(!passwordsMatch){
        throw new BadRequestError('Invalid Credentials')
    }


   // generate jwt
   //since we are using microservices and using a k8s cluster we can save the jwt secret as an env var in k8s so it can be accesible to all pods(services) in the cluster using the command:
   //kubectl create secret generic jwt-secret --from-literal=JWT_KEY=asdf13K*

   //use kubectl get secrets to list all secrets in k8s
   const userJWT = jwt.sign({
    id: existingUser.id, 
    email: existingUser.email
   }, process.env.JWT_KEY!);


   //store jwt in session
   req.session = {
    jwt : userJWT
   }

   
   res.status(200).send(existingUser)

});



export {router as signInRouter};
