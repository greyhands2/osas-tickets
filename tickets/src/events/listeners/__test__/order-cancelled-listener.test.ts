import {OrderCancelledEvent, OrderStatus} from '@osas-tickets/common'
import { OrderCancelledListener } from "../order-cancelled-listener"
import { Ticket } from "../../../models/ticket";
import mongoose from 'mongoose';
import { natsWrapper } from "../../../nats-wrapper"
import { Message } from 'node-nats-streaming';


const setup = async() => {
    //create an instance of the listener
    const listener = new OrderCancelledListener(natsWrapper.client);

    const orderId = new mongoose.Types.ObjectId().toHexString()

    //create and save a ticket
    const ticket = await Ticket.build({
        title: 'concert', 
        price: 99,
        userId: 'awf8u9adsf'
        
    });

    ticket.set({orderId })
    await ticket.save();

    //create the fake data object
    const data: OrderCancelledEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        
        ticket:{
            id: ticket.id
            
        }
    }

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }



    return {listener, ticket, data, msg, orderId};
}

it('updates the ticket, publishes an event and acks the message', async()=>{
    const {listener, ticket, data, msg, orderId} = await setup();

    await listener.onMessage(data, msg);
    const updatedTicket = await Ticket.findById(ticket.id);


    expect(updatedTicket!.orderId).not.toBeDefined()

    expect(msg.ack).toHaveBeenCalled()
    expect(natsWrapper.client.publish).toHaveBeenCalled();

})

it('acks the message', async()=>{
    const {listener, ticket, data, msg} = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
})


it('publishes a ticket updated event', async()=>{
    const {listener, ticket, data, msg} = await setup();

    await listener.onMessage(data, msg);
   


    expect(natsWrapper.client.publish).toHaveBeenCalled();


    //lets us check for the arguments passed to the client publish function

    //@ts-ignore
    console.log(natsWrapper.client.publish.mock.calls[0][1])

    // or without having to use the tsignore
    const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

    expect(data.id).toEqual(ticketUpdatedData.orderId);

})