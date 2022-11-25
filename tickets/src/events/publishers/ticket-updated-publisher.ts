import {Publisher, Subjects, TicketUpdatedEvent} from '@osas-tickets/common'



export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;

    
}