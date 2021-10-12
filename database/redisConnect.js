const redis=require('redis');
const client=redis.createClient();

client.on('error',(error)=>{
    console.log(error.message)
})

module.exports=client;