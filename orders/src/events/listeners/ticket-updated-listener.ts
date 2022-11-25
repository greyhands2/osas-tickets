import {Message} from 'node-nats-streaming'
import { Subjects, Listener, TicketUpdatedEvent } from '@osas-tickets/common'
import { QueueGroupName } from './queue-group-name';
import { Ticket } from '../../models/tickets';
export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;

    queueGroupName = QueueGroupName;

    async onMessage(data: TicketUpdatedEvent['data'], msg: Message): Promise<void> {
       const ticket = await Ticket.findByEvent(data);
       if(!ticket) {
        throw new Error('Ticket not found');
       } 

       const {title, price} = data;

       ticket.set({title, price});
       await ticket.save();
       msg.ack();
    }
}
