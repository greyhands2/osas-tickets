import {Subjects, PaymentCreatedEvent, Listener, OrderStatus} from '@osas-tickets/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/orders';
import { QueueGroupName } from './queue-group-name';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
   subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
   
   
   queueGroupName = QueueGroupName;
    async onMessage(data: PaymentCreatedEvent['data'], msg: Message): Promise<void>{
       const order = await Order.findById(data.orderId);



       if(!order){
        throw new Error('Order not found')
       }

       order.set({status: OrderStatus.Complete})

       await order.save();
       msg.ack();

        
    }
   
}