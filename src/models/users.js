import mongoose from 'mongoose'
import validator from 'validator'
import passwordValidator from 'password-validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {Task} from './tasks.js'
const { Schema } = mongoose;

//Defining your schema
//for setting the fields 
//https://mongoosejs.com/docs/schematypes.html
const UserSchema = new Schema({
    name : {
        type : String,
        required : true,
        trim : true,
        maxlength : 30
    },
    email : {
        type : String,
        unique : true,
        required : true,
        trim : true,
        maxlength : 30,
        validate(value) {
            //here we are using in built validator npm package to validate email
            if(!validator.isEmail(value)) {
                throw new Error("Email is not valid!!!")
            }
        }
    },
    age : {
        type : Number,
        default : 0,
        //inside validate we can add our own validations logic
        validate(value) {
            if(value<0) {
                throw new Error("Age cannot be negative!!!")
            }
        }
    },
    password : {
        type : String,
        required : true,
        validate(value) {
            // Create a schema
            //NPM package
            var schema = new passwordValidator();
            // Add properties to it
            schema
            .is().min(6)                                    // Minimum length 8
            .is().max(16)                                  // Maximum length 16
            .has().uppercase()                              // Must have uppercase letters
            .has().lowercase()                              // Must have lowercase letters
            .has().digits(2)                                // Must have at least 2 digits
            .has().not().spaces()                           // Should not have spaces
            .is().not().oneOf(['password']);                // Blacklist these values

            if(!schema.validate(value)) {
                throw new Error("Password doesn't match required criteraia")
            }
        }
    },
    token : {
        type : String,
        //required : true
    },
    profilepic : {
        type : Buffer
    }
},
{ timestamps: true }
)

//virtual 
UserSchema.virtual('tasks', {
    ref : 'Tasks',
    localField : '_id',
    foreignField : 'owner'
})

//validating login 
UserSchema.statics.findByCredentials = async (email,password) => {
    //check the user with given email
    const user = await User.findOne({email : email})
    if(!user) {
        throw new Error("Invalid Email/password !")
    }

    //check the password which was hashed
    const match = await bcrypt.compare(password,user.password)  //return true or false
    if(!match) {
        throw new Error("Invalid Email/password !")
    }  
    return user
}

//sending only nescessary data to users
UserSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.token
    delete userObject.profilepic


    return userObject
}

//generate auth token for a user
//Here we generate token for a single user instance
UserSchema.methods.generateauthtoken = async function() {
    const user = this
    //generating token
    const token = jwt.sign({ _id : user._id.toString() }, process.env.JWT_SECRET)
    return token
}

//hashing the password before savint it to the DB
//done using middleware schema(pre,post)
UserSchema.pre('save', async function(next) {
    console.log("before saving!!!")
    const user = this
    //hash the password only if it gets modified/updated
    if(user.isModified('password')) {
        //console.log("hashing password")
        user.password = await bcrypt.hash(user.password,10)
    }
    next()
  })

//removing the tasks related to the user when user gets deleted
UserSchema.pre('remove', async function(next) {
    console.log("before removing!!!")
    const user = this
    await Task.deleteMany({owner : user._id})
    next()
  })


//Creating a model 1st arg is name collection
//exporting user model to use in index.js file
export const User = mongoose.model('User', UserSchema)

// Constructing Documents
// An instance of a model is called a document
// const user1 = new User({
//     name  : "Rohitj",
//     email : "rohit@gmail.com",
//     password : "Rohit@123"
// }
// )

// //saving doc to the collection
// user1.save().then(() => {
//     console.log(user1)
// }).catch((error) => {
//     console.log(error)
// })