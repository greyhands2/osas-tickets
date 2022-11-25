import {Subjects, Publisher, ExpirationCompleteEvent} from '@osas-tickets/common'




export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;

    
}