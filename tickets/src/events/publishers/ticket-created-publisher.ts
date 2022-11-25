import {Publisher, Subjects, TicketCreatedEvent} from '@osas-tickets/common'



export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    subject: Subjects.TicketCreated = Subjects.TicketCreated;

    
}