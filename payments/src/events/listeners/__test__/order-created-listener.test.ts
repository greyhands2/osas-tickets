import {OrderCreatedEvent, OrderStatus} from '@osas-tickets/common'
import { OrderCreatedListener } from "../order-created-listener"

import mongoose from 'mongoose';
import { natsWrapper } from "../../../nats-wrapper"
import { Message } from 'node-nats-streaming';
import { Order } from '../../../models/order';


const setup = async() => {
    //create an instance of the listener
    const listener = new OrderCreatedListener(natsWrapper.client);


    //create and save a ticket
    const data: OrderCreatedEvent['data'] = {
       id: new mongoose.Types.ObjectId().toHexString(),
       version: 0,
       expiresAt: 're0f890f9',
       userId: 'fdv7d8f9f8v',
       status: OrderStatus.Created,
       ticket: {
        id: 'sfwfwefwef',
        price: 10
       }
    }


    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    

    return {listener, data, msg};
}

it('replicates the order info', async()=>{
    const {listener, data, msg} = await setup();

    await listener.onMessage(data, msg);
   const order = await Order.findById(data.id)


    expect(order!.price).toEqual(data.ticket.price);

})

it('acks the message', async()=>{
    const {listener, data, msg} = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
})

