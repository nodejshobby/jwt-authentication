const redis=require('redis');
const client=redis.createClient({
    url: process.env.REDIS_URL
});

client.on('error',(error)=>{
    console.log(error.message)
})

module.exports=client;