import mongoose from "mongoose";
import {Password} from '../utils/password'; 
// an interface that describes the properties required to create a new user

interface UserAttrs {
    email: string;
    password: string;
}



// an interface that describes the properties that the user model has
interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: UserAttrs): UserDoc;
}

// an interface that describes the properties a returned and created user document in mongodb has

interface UserDoc extends mongoose.Document {
    email: string;
    password: string;
}


const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required: [true, 'Email is required']
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    }
}, {
    toJSON:{
        transform(doc, ret){
            //convert _id to id
            ret.id = ret._id;
            delete ret._id;

            //ensure no user doc returns password and __v
            delete ret.password;
            delete ret.__v;
            

        }
    },
    toObject:{}
});

userSchema.pre('save', async function(done){
    if(this.isModified('password')){
        const hashed = await Password.toHash(this.get('password'));
        this.set('password', hashed);
        done();
    }

})

//note methods are defined on the document instance(userSchema.methods.build) while statics are defined on the model instance
userSchema.statics.build = (attrs: UserAttrs) => {
    return new User(attrs) 
}
const User = mongoose.model<UserDoc, UserModel>('User', userSchema);


export {User};