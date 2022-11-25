import {Publisher, OrderCancelledEvent, Subjects} from '@osas-tickets/common'




export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}