import {Listener, OrderCreatedEvent, OrderStatus, Subjects} from '@osas-tickets/common'
import { Message } from 'node-nats-streaming';
import { QueueGroupName } from './queue-group-name';
import { expirationQueue } from '../../queues/expiration-queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;

    queueGroupName = QueueGroupName;



    async onMessage(data: OrderCreatedEvent['data'], msg: Message): Promise<void> {
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
      await expirationQueue.add({
        orderId: data.id
      }, {
        //delay o
        delay
      }); 
      
      msg.ack();
    }
}