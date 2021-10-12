const mongoose=require('mongoose');
const bcrypt=require('bcrypt');
const Schema=mongoose.Schema;

const userSchema=Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    }, 
    password: {
        type: String,
        required: true,
    },
    emailVerifiedAt: {
        type: Date,
        default: ''
    },
    resetCode:{
        type: String,
        default: ''
    }
},{ timestamps: true});


userSchema.methods.validatePassword=async function(password){
    valid=await bcrypt.compare(password,this.password);
    return valid;
}

module.exports=mongoose.model('User',userSchema);