import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
username: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
    unique: true
},
email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true
},
password: {
    type: String,
    required: true
},
fullname: {
    type: String,
    required: true
},
avatar: {
    type: String
},
refreshToken: {
    type: String,
},
typeOfCustomer :{
    type: String,
    default: "Customer"
},
sellerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    unique: true
  }
},{timestamps: true
});


userSchema.pre("save",async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User= mongoose.model('User', userSchema);