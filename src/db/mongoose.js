import mongoose from 'mongoose'
const { Schema } = mongoose
// import validator from 'validator'
// import passwordValidator from 'password-validator'


//connect to local DB
export const connection = mongoose.connect(process.env.MONGODB_URL)





