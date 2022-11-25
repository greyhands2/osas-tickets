import {Listener, ExpirationCompleteEvent, Subjects, OrderStatus} from '@osas-tickets/common'
import { Message } from 'node-nats-streaming';
import { QueueGroupName } from './queue-group-name';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher'; 
import { Order } from '../../models/orders';
export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;

    queueGroupName = QueueGroupName;


    async onMessage(data:ExpirationCompleteEvent['data'], msg: Message): Promise<void> {
        const order = await Order.findById(data.orderId).populate('ticket');

        if(!order){
            throw new Error('Order not found')
        }


        if(order.status === OrderStatus.Complete){
            return msg.ack();
        }

        order.set({
            status: OrderStatus.Cancelled
            
        })

        await order.save();
        new OrderCancelledPublisher(this.client).publish({
            id: order.id,
            version: order.version,
            ticket:{
                id: order.ticket.id
            }
        })

        msg.ack();

    }
}