import request from 'supertest'
import mongoose from 'mongoose'
import {app} from '../../app'
import {Order, OrderStatus} from '../../models/orders'
import {Ticket} from '../../models/tickets'
import {natsWrapper} from '../../nats-wrapper'
it('returns an error if the ticket does not exist', async()=>{
    const ticketId = new mongoose.Types.ObjectId().toHexString();


    await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
        ticketId
    })
    .expect(404)
})

it('returns an error if the ticket is already reserved', async()=>{
    const ticket = Ticket.build({
        title: 'concert', 
        price: 20,
        id: new mongoose.Types.ObjectId().toHexString()
    });
    await ticket.save();
    const order = Order.build({
        ticket,
        userId: 'lassdfjfoierf',
        status: OrderStatus.Created,
        expiresAt: new Date()
    });

    await order.save();

    await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ticketId: ticket.id})
    .expect(400)
})


it('reserves a ticket', async()=>{
    const ticket = Ticket.build({
        title: 'concert', 
        price: 20,
        id: new mongoose.Types.ObjectId().toHexString()
    });
    await ticket.save();
    await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ticketId: ticket.id})
    .expect(201)
    

    
})


it('emits an order created event', async()=>{
    const ticket = Ticket.build({
        title: 'concert', 
        price: 20,
        id: new mongoose.Types.ObjectId().toHexString()
    });
    await ticket.save();
    await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ticketId: ticket.id})
    .expect(201)


    expect(natsWrapper.client.publish).toHaveBeenCalled()
});