import mongoose, {} from 'mongoose';
import {app} from './app';
const start =  async () => {
    if(!process.env.JWT_KEY){
        throw new Error('JWT_KEY must be defined')
    }

    if(!process.env.MONGO_URI){
        throw new Error('MONGO_URI must be defined')
    }
    try {
        await mongoose.connect(process.env.MONGO_URI);
        // await mongoose.connect('mongodb://auth-mongo-srv:27017/auth', {
        //     useNewUrlParser: true,
        //     useUnifiedTopology: true,
        //     useCreateIndex: true
        // })
    } catch(e){
        console.log(e)
    }
    app.listen(3000, ()=>{
        console.log('app running on port 3000!!!!!!!!!!');
    })
   
}


start();



