require('../db/mongoose')
const mongoose = require("mongoose");
const eValidator = require("email-validator")
const { isValidPassword } = require("mongoose-custom-validators")

let User1 = new mongoose.Schema({
    name: {type: String, required: true, trim: true},
    email: {
        type: String, unique: true, validate(value) {
            if (eValidator.validate(value) === false) {
                throw new Error("Error: email is invalid");
            }
        },
        validate: {
            validator: async function (email) {
                const user = await this.constructor.findOne({email});
                if (user) {
                    if (this.id === user.id) {
                        return true;
                    }
                    return false;
                }
                return true;
            },
            message: props => 'Email is already in use.'
        },
        required: [true, 'User email required']
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error("Age cannot be below zero")
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: (value) => isValidPassword(value, {minlength: 7}),
            message: 'Password is too short'
        },
        validate(value) {
            if (value.match(/\bpassword\S*\b/g)) {
                throw new Error("Too easy:)")
            }
        }
    }
})
const User = mongoose.model("User", User1)
module.exports = User;
