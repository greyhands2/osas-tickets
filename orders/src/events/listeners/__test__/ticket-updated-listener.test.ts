import mongoose from "mongoose"
import {Message} from 'node-nats-streaming'
import { TicketUpdatedEvent } from "@osas-tickets/common"
import { TicketUpdatedListener } from "../ticket-updated-listener" 
import { Ticket } from "../../../models/tickets"
import { natsWrapper } from "../../../nats-wrapper"



const setup = async()=>{
    //create a listener
    const listener = new TicketUpdatedListener(natsWrapper.client);

    //create and save a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    })
    await ticket.save();

    //create a fake data object
    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        version: ticket.version + 1,
        title: 'U2 Concert',
        price: 200,
        userId: 'fwrfwrfwrfwfwfrfw'
    }

    //create a fake message object
    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    //return all of this stuff

    return {data, listener, msg, ticket};

};


it('finds, updates, and saves a ticket', async()=>{
    const { msg, data, ticket, listener} = await setup();


    await listener.onMessage(data, msg);
    const updatedTicket = await Ticket.findById(ticket.id);


    expect(updatedTicket!.title).toEqual(data.title);

    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
})


it('acks the message', async()=>{
    const { msg, data, listener} = await setup();


    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled()
})


it('does not call ack if the event has a skipped version number', async()=>{
    const {msg, data, listener, ticket} = await setup()


    data.version = 10;

    try {
        await listener.onMessage(data, msg);
    } catch(err){

    }
    
    expect(msg.ack).not.toHaveBeenCalled()
})