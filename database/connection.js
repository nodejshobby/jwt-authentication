const mongoose=require('mongoose');
module.exports=async ()=>{
    try {
        await mongoose.connect(process.env.DB_URL,{
            useUnifiedTopology: true,
            useNewUrlParser: true,
        })
        console.log("Connected to database sucessfully");
    }catch(error){
        console.log(error.message)
    }
}