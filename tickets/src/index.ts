import mongoose, {} from 'mongoose';
import { natsWrapper } from './nats-wrapper'; 
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';

import { OrderCreatedListener } from './events/listeners/order-created-listener';
import {app} from './app';
const start =  async () => {
    if(!process.env.JWT_KEY){
        throw new Error('JWT_KEY must be defined')
    }

    if(!process.env.MONGO_URI){
        throw new Error('MONGO_URI must be defined')
    }

    if(!process.env.NATS_CLIENT_ID){
        throw new Error('NATS_CLIENT_ID must be defined')
    }

    if(!process.env.NATS_URL){
        throw new Error('NATS_URL must be defined')
    }

    if(!process.env.NATS_CLUSTER_ID){
        throw new Error('NATS_CLUSTER_ID must be defined')
    }
    try {
        
        await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL);

        natsWrapper.client.on('close', ()=>{
            console.log('nats connection closed')
            process.exit();
        })
        process.on('SIGINT', ()=> natsWrapper.client.close())
        process.on('SIGTERM', ()=> natsWrapper.client.close())


        await new OrderCancelledListener(natsWrapper.client).listen();
        await new OrderCreatedListener(natsWrapper.client).listen();
        
        await mongoose.connect(process.env.MONGO_URI);
        // await mongoose.connect('mongodb://auth-mongo-srv:27017/auth', {
        //     useNewUrlParser: true,
        //     useUnifiedTopology: true,
        //     useCreateIndex: true
        // })
    } catch(e){
        console.log(e)
    }
    app.listen(3000, ()=>{
        console.log('app running on port 3000!!!!!!!!!!');
    })
   
}


start();



