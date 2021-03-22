const mongoose = require('mongoose');
const { default: validator } = require('validator');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//schema
const logindataSchema = new mongoose.Schema({
    fullname: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        required: true,
        unique: true, 
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid Email");
            }
        }
    },
    password: {
        type: String,
        required: true
    },
    tokens: [{
        token:{
            type: String,
            required: true
        }
    }]
});

//generating JWT token
logindataSchema.methods.generateAuthToken = async function() {
    try{
        const token = jwt.sign({_id: this._id.toString()}, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token: token});
        await this.save();
        //console.log("token: "+token);
        return token;
    } catch (error) {
        console.log("the error part "+error);
    }
}

//converting password into hash
logindataSchema.pre("save", async function(next) {

    // hash the password if it has been modified (or is new)
    if (this.isModified('password')) {
            this.password = await bcrypt.hash(this.password, 10);
    }    
    next();
});

const Logindata = new mongoose.model("Logindata", logindataSchema);

module.exports = Logindata;