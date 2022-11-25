
import {MongoMemoryServer} from 'mongodb-memory-server'
import mongoose, { ConnectOptions } from 'mongoose'
import jwt from 'jsonwebtoken'


declare global {
    function signin(id? : string): string[];
    
        
}
jest.mock('../nats-wrapper');

let mongo: any;

beforeAll(async()=>{
    //ensure we clear all mock implementation calls , in our case the mock nats-wrapper publish function call
    jest.clearAllMocks();
    process.env.JWT_KEY = 'sfwfwfwefwfwefs';
    mongo = await MongoMemoryServer.create();
    const mongoUri = await mongo.getUri();


    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    } as ConnectOptions)
})


beforeEach(async()=>{
    const collections = await mongoose.connection.db.collections();



    for(let collection of collections){
        await collection.deleteMany({});
    }
})


afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
})


global.signin =  (id?: string) => {
    //build a jwt payload {id, email}
    const payload = {
        id: id || new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com'
    }
    //create the jwt
    const token = jwt.sign(payload, process.env.JWT_KEY!);

    //build session object {jwt: MY_JWt}
    const session = {jwt:token}

    //turn object into JSON
    const sessionJSON = JSON.stringify(session);
    //take JSON and encode it as base64
    const base64 = Buffer.from(sessionJSON).toString('base64');
    //return a string thats the cookie with the encoded data
    return [`sess=${base64}`];



}