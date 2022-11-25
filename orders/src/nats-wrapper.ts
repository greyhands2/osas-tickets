import nats, {Stan} from 'node-nats-streaming';
//singleton class

class NatsWrapper {
    //the question mark sign tells typescript that this property might be undefined for some period of time
    private _client?: Stan;

    get client(){
        if(!this._client){
            throw new Error('Cannot access nats client before connecting')
        }

        return this._client;
    }

    connect(clusterId: string, clientId: string, url:string): Promise<void>{
        this._client = nats.connect(clusterId, clientId, {url});

        return new Promise((res,rej)=>{
            this.client.on('connect', ()=>{
                console.log('connected to nats')
                res();
            });

            this.client.on('error', (err)=>{
                rej(err)
            })
        })
        

    }
}

export const natsWrapper = new NatsWrapper()