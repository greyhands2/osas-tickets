import {Listener, OrderCreatedEvent,  Subjects} from '@osas-tickets/common'
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { QueueGroupName } from './queue-group-name';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;

    queueGroupName = QueueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message): Promise<void> {
     const order = Order.build({
        id: data.id,
        price: data.ticket.price,
        status: data.status,
        userId: data.userId,
        version: data.version
     });



     await order.save();

     msg.ack();
    }

}