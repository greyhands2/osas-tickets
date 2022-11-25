import {OrderCreatedEvent, OrderStatus} from '@osas-tickets/common'
import { OrderCreatedListener } from "../order-created-listener"
import { Ticket } from "../../../models/ticket";
import mongoose from 'mongoose';
import { natsWrapper } from "../../../nats-wrapper"
import { Message } from 'node-nats-streaming';


const setup = async() => {
    //create an instance of the listener
    const listener = new OrderCreatedListener(natsWrapper.client);


    //create and save a ticket
    const ticket = await Ticket.build({
        title: 'concert', 
        price: 99,
        userId: 'awf8u9adsf'
    });


    await ticket.save();

    //create the fake data object
    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: 'sfsdfsdfd43r2d',
        expiresAt: 'sdfsdd089sdas',
        ticket:{
            id: ticket.id,
            price: ticket.price
        }
    }

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }



    return {listener, ticket, data, msg};
}

it('sets the userid of the ticket', async()=>{
    const {listener, ticket, data, msg} = await setup();

    await listener.onMessage(data, msg);
    const updatedTicket = await Ticket.findById(ticket.id);


    expect(updatedTicket!.orderId).toEqual(data.id);

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