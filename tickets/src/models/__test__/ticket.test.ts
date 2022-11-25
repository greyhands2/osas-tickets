import { Ticket } from "../ticket";


it('implements optimistic concurrency control', async() =>{
    //create an instance of a ticket
    const ticket = Ticket.build({
        title: 'concert', 
        price: 20,
        userId:'123'
    })


    //save ticket to the db

    await ticket.save();


    //fetch the ticket twice
    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);


    //make two seperate changes to the tickets we fetch
    firstInstance!.set({price: 10});
    secondInstance!.set({price: 15});


    //save the first fetched ticket

    await firstInstance!.save();


    //save the second fetched ticket and expect an error because of an outdated version number
    expect(async()=>{
        await secondInstance!.save();
    }).toThrow();
        
   
})