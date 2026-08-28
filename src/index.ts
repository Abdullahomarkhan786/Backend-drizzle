import { createServer } from 'node:http';
import { createApplication } from './app/index.js';

async function main(){
    try{
        const app=createApplication();
        const server=createServer(app);
        const PORT:number=3000;
        server.listen(PORT,()=>{
            console.log(`Running on port ${PORT}`)
        })
        
    }catch(err){
    console.log("err")
    throw err;

    }

}

main();