import mongoose from 'mongoose'
import {Order, OrderStatus} from './orders'
import {updateIfCurrentPlugin} from 'mongoose-update-if-current'

interface TicketAtrrs {
    title: string;
    price: number;
    id: string;
}

type FindByEvent = {
    id: string; 
    version: number;
}
//export a ticket doc so we can use it in the order for referencing and population
export interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    version: number;
    isReserved(): Promise<boolean>;
}


interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAtrrs) : TicketDoc;

    findByEvent(event: FindByEvent): Promise<TicketDoc | null>
}


const TicketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
}, {
    toJSON: {
        transform(doc, ret){
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

TicketSchema.set('versionKey', 'version');
TicketSchema.plugin(updateIfCurrentPlugin)

//adding a function to the model
TicketSchema.statics.build = (attrs: TicketAtrrs) => {
    
    return new Ticket({
        _id: attrs.id,
        title: attrs.title,
        price: attrs.price
    });
};


TicketSchema.statics.findByEvent = (event: FindByEvent) => {
    return Ticket.findOne({
        _id: event.id,
        version: event.version - 1
    });
}


//adding a method to the returned document
TicketSchema.methods.isReserved = async function(){
    //this is === the ticket document we just called isReserved on
    const existingOrder = await Order.findOne({
        ticket: this,
        status: {
            $in: [
                OrderStatus.Created,
                OrderStatus.AwaitingPayment,
                OrderStatus.Complete
            ]
        }
    });

    return !!existingOrder;

}
const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', TicketSchema);


export { Ticket };