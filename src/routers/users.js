import express from 'express'
import {User} from '../models/users.js'
import {Auth} from '../middleware/auth.js'
import multer from 'multer'
import sharp from 'sharp'
//import jwt from 'jsonwebtoken'
const router = express.Router()

// router.get('/test',(req,res) => {
//     res.send("created a test router!!!")
// })

// export {router}

//setting up route /users signup
router.post('/Users', async function (req, res) {
    //sending data/json query from postman body 
    // res.send(req.body)
    // const user = new User(req.body)
    // //saving doc to the collection and to the mongodb
    // user.save().then(() => {
    //     //console.log(user)
    //     res.status(201).send(user)
    // }).catch((error) => {
    //     //send the status code aloing with ther eror
    //     res.status(400).send(error)
    //     //console.log(error)
    // })      

    //***using async-await***
    const user = new User(req.body)
    //save() return a promise so use await for it
    //use try catch to handle errors
    try {
    //gen token and saving it while signing up the user
    user.token = await user.generateauthtoken()
    const new_user = await user.save()
    //if save() run fine then
    //console.log(new_user)
    res.status(201).send({user : new_user,auth_token : new_user.token })
    } catch (e) {
        //if validation fails
        res.status(400).send(e)
    }

})

//login users... should definitely generate jwt auth token and verify for performing authentication ops

router.post('/Users/login',async function (req,res) {
    try {
        const email = req.body.email
        const password = req.body.password

        //findByCredentials is declared on our own which perfroms on User collection
        const user = await User.findByCredentials(email,password)

        //generate Authtoken is perfromed on a single user which is an instance of User collection
        const auth_token = await user.generateauthtoken()

        // const decoded = jwt.verify(auth_token, "enteryourownsignature");  
        // var userId = decoded._id  
        // console.log(userId)  
        
        //Now save the tokens to the collections each time the user logged in
        const updated_token = await User.findByIdAndUpdate(user._id.toString(), {token : auth_token} , { new:true, runValidators:true})
        //console.log(updated_token)
        res.send({user : updated_token,auth_token})
    } catch (e) {
        res.status(400).send(e)
    }
})

//Logout Users
router.post('/Users/logout',Auth,async (req,res) => {

    try {
        //save() is not working so I am using findByIdAndUpdate
        await User.findByIdAndUpdate(req.user._id.toString(), {token : ""},{new : true})
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

//get all the users
//use Auth middleware here to view the user profile
router.get('/Users/me',Auth,async (req,res) => {
     res.send(req.user)
})


// //get user by id
// router.get('/User/:id',async (req,res) => {
//     const _id = req.params.id
//     try {
//         const user = await User.findById(_id)
//         if(!user) {
//             //If no user present with the given id
//             return res.status(400).send()
//         }
//         res.send(user)
//     } catch (e) {
//         //if there is server error
//         res.status(500).send()
//     }
// })

//Update authenticated User by adding middleware 
router.patch('/Users/me',Auth,async (req,res) => {
    //const _id = req.params.id 
    const _id = req.user._id
    const updates = req.body   //catch the json req
    const update_props = Object.keys(updates)
    const allowed_updates = ['name','age','email','password'] 
    //IF user want to update other than these then send 404
    //every function return true if everyhting is true 
    const is_update = update_props.every((prop) => {
        return allowed_updates.includes(prop)
    })

    if(!is_update) {
        //If the property is not allowed/present in DB to change
        return res.status(400).send({ "error" : "Invalid update!!!"})
    }
    try {

        //this code is written to use the middleware save() defined in models/users.js. Here we hash password if updated

        // const updated_user = await User.findById(_id)
        // update_props.forEach((prop) => {
        //     updated_user[prop] = req.body[prop]
        // })
        // //console.log(updated_user)
        // await updated_user.save()
        const updated_user = await User.findByIdAndUpdate(_id,updates,{ new:true, runValidators:true})
        res.send(updated_user)
    } catch (e) {
        //if validation/auth  fails
        res.status(400).send()
    }
})

//Delete authenticated user by adding middleware 
router.delete('/Users/me', Auth, async(req,res) => {

    try {
        //here make sure that we should delete all the tasks w.r.t the USER deleted so use middleware
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

const upload = multer({ 
    limits: {
        //file limit is 1mb
        fileSize : 1000000
    },
    fileFilter (req, file, cb) {
        //match using reg exp
        //other than these should throw an error
         if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
           return cb(new Error('Please upload an image!!'))
         }
         cb(undefined,true)
      }
})

router.post('/Users/me/profilepic',Auth,upload.single('upload'),async (req,res) => {
    const _id = req.user._id
    //resizing and converting the image to png
    const buffer = await sharp(req.file.buffer).resize({width : 250, height : 250}).png().toBuffer()
    await User.findByIdAndUpdate(_id,{profilepic :buffer},{ new:true})
    res.send()
},(error,req,res,next) => {
    res.status(400).send({ error : error.message})
})

router.delete('/Users/me/profilepic',Auth,async (req,res) => {
    try {
    const _id = req.user._id
    //deleting the binary buffer 
    await User.findByIdAndUpdate(_id,{profilepic :undefined})
    res.send()
    } catch(e) {
        res.status(500).send()
    }
})

router.get('/Users/:id/profilepic',async(req,res) => {
    try {
        const _id = req.params.id 
        const user = await User.findById(_id)
        //console.log(avatar)
        if(user.profilepic) {
            //by default response is set to application/json
            res.set('Content-Type','image/png')
            return res.send(user.profilepic)
        }
        throw new Error()
    } catch (e) {
        res.status(400).send()
    }
})


export {router as user_router}
