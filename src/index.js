//setting up xpress server here
import express from 'express'
//https://expressjs.com/en/4x/api.html
//https://mongoosejs.com/docs/api.html#model_Model.find

//getting connection here
import {connection} from './db/mongoose.js';
console.log(connection)

//getting users and tasks obj here
// import {User} from './models/users.js';
// import {Task} from './models/tasks.js';
import {user_router} from './routers/users.js'
import {task_router} from './routers/tasks.js'

const app = express()
const port = process.env.PORT

//express middleware 
//Middleware : (New Request => Do some ops(like authenticating) => call route handler)
//without middleware : (New Request =>  call route handler)
// app.use((req,res,next) => {
//      console.log(req.method)
//      console.log(req.path)
//      next()  //must call next otherwise it stucks here
// })

//create a middleware to let the user know site is under maintenance
// app.use((req,res,next) => {
//     res.status(503).send("Website is under maintenance.Please try after sometime!")
// })

//note *** we can create middlewares for specific routes if we want

//to parse json response 
app.use(express.json())

//using USER router!
app.use(user_router)

//using TASK router!
app.use(task_router)

//PORT LISTEN
app.listen(port,() => {
    console.log("Starting Server on " + port)
})

//password hashing using bcrypt
// import bcrypt from 'bcrypt'

// const saltRounds = 10;
// const myPlaintextPassword = 'Shyam@123234';
// bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
//     // Store hash in your password DB.
//     console.log(hash)
// });

//generating and verifying JWT auth token
// import jwt from 'jsonwebtoken'
// //generating
// const token = jwt.sign({ id: 'jhf76#jg' }, 'enteryourownsignature')
// console.log(token)

// //verifying token should use the same signature for validation
// var decoded = jwt.verify(token, 'enteryourownsignature');
// console.log(decoded)

//relationship between task and user sample check

// import {Task} from './models/tasks.js'
// import {User} from './models/users.js'

// const main = async () => {

//     //1)find user of task
//     // const task = await Task.findById('62b1dab051f2a93473cb6244')
//     // //console.log(task.owner) //prints only owner id
//     // //to print the full user profile use populate but before that in models/tasks.js add ref 
//     // await task.populate('owner')
//     // console.log(task.owner) //prints user profile

//     //2)find tasks of the user
//     const user = await User.findById('62b1da9551f2a93473cb623e')
//     await user.populate('tasks')
//     console.log(user.tasks) //we don't have tasks array so setup virtual prop

// }

// main()



