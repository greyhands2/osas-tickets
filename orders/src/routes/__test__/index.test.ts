import request from 'supertest'
import mongoose from 'mongoose'
import {app} from '../../app'
import {Order, OrderStatus} from '../../models/orders'
import {Ticket, TicketDoc} from '../../models/tickets'


const buildTicket = async(): Promise<TicketDoc> => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        id: new mongoose.Types.ObjectId().toHexString()
    });
    await ticket.save();
    return ticket;
}

it('fetches orders for a particular user', async()=>{
    //create 3 tickets
const ticket1 = await buildTicket();
const ticket2 = await buildTicket();
const ticket3 = await buildTicket();

const user1 = global.signin();
const user2 = global.signin();
    //create one order as user 1
   await request(app)
    .post('/api/orders')
    .set('Cookie', user1)
    .send({ticketId: ticket1.id})
    .expect(201);

   



    //create 2 tickets as user 2
   const {body: order2 } = await request(app)
    .post('/api/orders')
    .set('Cookie', user2)
    .send({ticketId: ticket2.id})
    .expect(201);


   const {body:order3} = await request(app)
    .post('/api/orders')
    .set('Cookie', user2)
    .send({ticketId: ticket3.id})
    .expect(201);

    //make request to get orders for user 2
    const response = await request(app)
        .get('/api/orders')
        .set('Cookie', user2)
        .expect(200);


    //make sure we only got orders for user 2
    expect(response.body.length).toEqual(2)
    expect(response.body[0].id).toEqual(order2.id)
    expect(response.body[1].id).toEqual(order3.id)


})

