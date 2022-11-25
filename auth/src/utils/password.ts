import {scrypt, randomBytes} from 'crypto';
import {promisify} from 'util'

const scryptAsync = promisify(scrypt);
export class Password {
    //static methods are methods we can access without an instance of the class

    //since it's an async function it by default returns  a promise but we can use generics syntax to specify the type the promise would come with
    static async toHash(password: string): Promise<string>{
        const salt = randomBytes(8).toString('hex');

        const buf = (await scryptAsync(password, salt, 64)) as Buffer;


        return `${buf.toString('hex')}.${salt}`;

    }


    static async compare(storedPassword: string, suppliedPassword: string): Promise<boolean>{

        const [hashedPassword, salt] = storedPassword.split('.');

        const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;

        return buf.toString('hex') === hashedPassword;

    }
}