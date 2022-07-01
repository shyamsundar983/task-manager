import jwt, { decode } from 'jsonwebtoken'
import { User } from '../models/users.js'
//mongodb+srv://taskapp:<password>@cluster0.c056j.mongodb.net/test

export const Auth = async (req,res,next) => {
    //console.log(req.header('Authorization'))
    try {
    const token = req.header('Authorization').replace("Bearer ","")
    //verify the token 
    const decoded = jwt.verify(token,process.env.JWT_SECRET)
    //console.log(decoded._id)
    //share the user details to the router where this middleware is used
    const user = await User.findOne({_id : decoded._id, token : token})
    if(!user) {
        throw new Error()
    }
    //console.log(user)
    req.user = user
    next()
    } catch (e) {
        res.status(400).send("Please authenticate correctly!!")
    }
}