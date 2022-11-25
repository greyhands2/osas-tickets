import {OrderCancelledEvent, OrderStatus} from '@osas-tickets/common'
import { OrderCancelledListener } from "../order-cancelled-listener"

import mongoose, { isObjectIdOrHexString } from 'mongoose';
import { natsWrapper } from "../../../nats-wrapper"
import { Message } from 'node-nats-streaming';
import { Order } from '../../../models/order';


const setup = async() => {
    //create an instance of the listener
    const listener = new OrderCancelledListener(natsWrapper.client);

    const orderId = new mongoose.Types.ObjectId().toHexString()

    const order = Order.build({
        id: orderId,
        status: OrderStatus.Created,
        price: 10,
        userId: 'eqdwqeded',
        version: 0
    })

    await order.save();

    //create the fake data object
    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        version: 1,
        
        ticket:{
            id: 'lsjjwddqd'
            
        }
    }

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }



    return {listener, data, msg, order};
}

it('updates the status of the order', async()=>{
    const {listener, data, msg, order} = await setup();

    await listener.onMessage(data, msg);
    const updatedOrder = await Order.findById(order.id)


    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)

    

})

it('acks the message', async()=>{
    const {listener,  data, msg} = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
})

