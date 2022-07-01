import express from 'express'
import {Task} from '../models/tasks.js';
const router = express.Router()
import {Auth} from '../middleware/auth.js'

// router.get('/test',(req,res) => {
//     res.send("created a test router!!!")
// })

// export {router}

//setting up route /Tasks
router.post('/Tasks', Auth, async function (req, res) {
    //sending data/json query from postman body 
    // res.send(req.body)
    //const task = new Task(req.body)
    //we are also providing the owner_id not manually but after auth
    const task = new Task({
        ...req.body,
        owner : req.user._id
    })
    //saving doc to the collection and to the mongodb
    try {
        const new_task = await task.save()
        res.status(201).send(new_task)
    } catch (e) {
        //send the status code along with the error
        //if validation fails
        res.status(400).send(e)
    }
})      

//get all the tasks of a user 
// (/Tasks?status=true) here user can pass the query status = true/false or nothing based on that we getv tasks
// /Tasks?status=true&limit=2&skip=2  PAGINATION
//sort
// /Tasks/sortBy=createdAt:desc   (it can be desc or asc user decides)
// {{url}}/Tasks?status=false&limit=2&skip=2&sortBy=createdAt:asc
router.get('/Tasks',Auth,async (req,res) => {
    //sort the data
    const sort = {}
    if(req.query.sortBy) {
        const parts = req.query.sortBy.split(":")
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try {
        //if status =  true/false
        if(req.query.status) {
            const status = req.query.status
            const tasks = await Task.find({owner : req.user._id, status : status},null,{limit : parseInt(req.query.limit), skip : parseInt(req.query.skip), sort : sort})
            return res.send(tasks)
         }
         //if there is no status passed
        const tasks = await Task.find({owner : req.user._id},null, {limit : parseInt(req.query.limit), skip : parseInt(req.query.skip), sort : sort})
        res.send(tasks)
    } catch(err) {
        res.status(500).send()
    }
})

//get task by id for a user
router.get('/Task/:id',Auth,async (req,res) => {
    const task_id = req.params.id
    try {
        const task = await Task.findOne({_id : task_id , owner : req.user._id})
        if(!task) {
            return res.status(400).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

//Update Task by id
router.patch('/Task/:id',Auth,async (req,res) => {
    const task_id = req.params.id 
    const updates = req.body   //catch the json req
    const update_props = Object.keys(updates)
    const allowed_updates = ['description','status'] 
    //IF user want to update other than these then send 404
    //every function return true if everyhting is true 
    const is_update = update_props.every((prop) => {
        return allowed_updates.includes(prop)
    })

    if(!is_update) {
        //If the property is not allowed/present in DB to change
        return res.status(404).send({ "error" : "Invalid update!!!"})
    }
    try {
    const updated_task = await Task.findOneAndUpdate({_id : task_id,owner : req.user.id},updates,{ new:true, runValidators:true})
    if(!updated_task) {
        //If no task present with the given id
        return res.status(400).send()
    }
    //update completed
    res.send(updated_task)
    } catch (e) {
        //if validation fails
        res.status(400).send()
    }
})

//Delete task by id
router.delete('/Task/:id', Auth,async(req,res) => {
    const task_id = req.params.id 
    try {
        const deleted_task = await Task.findOneAndDelete({_id : task_id,owner : req.user.id})
        if(!deleted_task) {
            return res.status(400).send()
        }
        res.send(deleted_task)
    } catch (e) {
        res.status(500).send()
    }
})

export { router as task_router }