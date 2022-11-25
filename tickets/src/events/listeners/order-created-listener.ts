import {Listener, OrderCreatedEvent, OrderStatus, Subjects} from '@osas-tickets/common'
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { QueueGroupName } from './queue-group-name';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';
export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;

    queueGroupName = QueueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message): Promise<void> {
       //find the ticket that the order is reserving
       const ticket = await Ticket.findById(data.ticket.id);

       
       //if no ticket throw error
        if(!ticket){
            throw new Error('Ticket not found')
        }


       //mark ticket as being reserved by setting its orderId prop
        ticket.set({orderId: data.id})


       //save the ticket
        await ticket.save();
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            price: ticket.price,
            title:  ticket.title,
            userId: ticket.userId,
            orderId: ticket.orderId,
            version: ticket.version
        });
       //ack the message
       msg.ack();
    }

}