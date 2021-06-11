const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const validator = require("validator/validator.js")
const jwt = require('jsonwebtoken');


let userSchema =  new mongoose.Schema({
        name: {
            type: String,
            required: true,
            trim: true
        },

        age:{
            type:Number,
            validate(value){
                if(value < 0){
                    throw new Error("Age can't be below zero")
                }
            }
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true,
            validate(value) {
                if(validator.isEmail(value) == false){
                    throw new Error("Email is invalid")
                }
            }
        },
        password: {
            type: String,
            required: true,
            trim: true,
            validate(value) {
                if(value.length < 7){
                    throw new Error("Довжина пароля має бути більше 6")
                }
                if(value.indexOf("password") >= 0){
                    throw new Error("Пароль не може містити слово password")
                }
            }
        },
        tokens: [{
            token: {
                type: String,
                required: true,
            }
        }]
    }
)

userSchema.pre('save', async function(next) {
    const user = this;
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});
userSchema.statics.findOneByCredentials = async (email, password) => {
    const user = await module.exports.findOne({email});

    if (!user){
        throw new Error('Incorrect email!');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch){
        throw new Error('Incorrect password');
    }
    return user;
};
userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({_id: user._id.toString()}, 'kdweueksdsjfij');
    user.tokens = user.tokens.concat({token});
    await user.save();
    return token;
};
userSchema.methods.toJSON = function (){
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    return userObject;
};
userSchema.virtual('tasks', {
    ref: "Task",
    localField: '_id',
    foreignField: 'owner'
});

const User = mongoose.model('User',userSchema);

module.exports = User;
