require('dotenv').config();
const express=require('express');
const morgan=require('morgan');
const cors=require('cors');
const path=require('path');



const authRoutes=require('./routes/auth.route');

require('./database/connection')();

const app=express();
const port=process.env.PORT || 3000;

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))


app.use('/api/v1/auth',authRoutes)

app.use((req,res,next)=>{
    error=new Error("Resource not found");
    error.status=404;
    next(error)
})

app.use((error,req,res,next)=>{
    stausCode=error.status || 500;
    res.status(stausCode).json({ message: error.message });
    next()
})

app.listen(port,()=>{
    console.log(`Server running at http://localhost:${port}`);
})


