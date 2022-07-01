import mongoose from 'mongoose'
import validator from 'validator'
import passwordValidator from 'password-validator'
const { Schema } = mongoose;

const taskSchema = new Schema({
    description : {
        type : String,
        required : true,
        trim : true
    },
    status : {
        type : Boolean,
        required : true,
    },
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'User'  //reference to other model to create relationship between 2 entities
    }
},
{ timestamps: true }
)


//define collection name
export const Task = mongoose.model('Tasks', taskSchema);
