import {Message} from 'node-nats-streaming'
import {Subjects, Listener, TicketCreatedEvent} from '@osas-tickets/common'
import { QueueGroupName } from './queue-group-name';
import { Ticket } from '../../models/tickets'


export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    subject: Subjects.TicketCreated = Subjects.TicketCreated;

    queueGroupName = QueueGroupName;
    async onMessage(data: TicketCreatedEvent['data'], msg: Message): Promise<void>{
        const {title, price, id} = data;
        const ticket = Ticket.build({
            title, price, id
        })
        await ticket.save()

        msg.ack();
    }
}