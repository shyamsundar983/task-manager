import mongodb from 'mongodb'
const mongoClient = mongodb.MongoClient
const ObjectId = mongodb.ObjectId

//*** CRUD operations ***

const connectionURL = "mongodb://127.0.0.1:27017"   //give full ip addrees
const databaseName = "task-manager"

//creating our own object id
// const obj = new ObjectId()
// console.log(obj.toHexString())
// console.log(obj.getTimestamp())
//if we want o pass obj id while inserting documents we can do that too but mongodb server takes care of it

//Refer https://mongodb.github.io/node-mongodb-native/4.6/classes/Collection.html#insertMany
mongoClient.connect(connectionURL,{ useNewUrlParser: true},(error,client) => {
    if(error) {
        return console.log("unable to connect to database")
    }

    const db = client.db(databaseName)

    //1)Create

    // db.collection('users').insertOne({
    //     name : "Shyam",
    //     age : 22
    // })

    
    //inserting multiple docs at a time used callback as lat argument
    // db.collection('tasks').insertMany([
    //     {
    //         description : "Go to the Movie",
    //         completed : true
    //     },
    //     {
    //         description : "Go to the Beach",
    //         completed : false
    //     },
    //     {
    //         description : "Go to the museum",
    //         completed : true
    //     }
    //     ],(error,result) => {
    //     if(error) {
    //         return console.log("Cannot insert docs into tasks!!")
    //     }

    //     console.log("Docs inserted succesfully into tasks!")
    //     console.log(result.insertedCount)
    // })

    //2)Find (read)

    // db.collection('users').find({name : "Shyam"}).toArray((error,result) =>{
    //     if(error) {
    //         return console.log('Cannot fetch required documents')
    //     }
    //     console.log(result)
    // })

    // db.collection('tasks').find({completed : false}).toArray((error,results) => {
    //     if(error) {
    //         return console.log('Cannot fetch required documents')
    //     }
    //     console.log(results)
    // })

    //3)UPdateOne used promises..
    // db.collection('users').updateOne({age : 22 },
    //     { $set : {name : "Shyam Sundar"}
    // }).then((result) => {
    //     console.log(result)
    // }).catch((error) => {
    //     console.log(error)
    // })

    // db.collection('users').updateMany({age : 22 },
    //     { $set : {name : "Sundar"}
    // }).then((result) => {
    //     console.log(result)
    // }).catch((error) => {
    //     console.log(error)
    // })

    //4)Delete

    db.collection('tasks').deleteOne({
        completed : true 
    }).then((result) => {
        console.log(result)
    }).catch((error) => {
        console.log(error)
    })


}) //check the result in Studio 3T

