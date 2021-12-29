const express = require('express')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gdsos.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
      await client.connect();
      const database = client.db('doctors_portal')
      const appointmentCollection = database.collection('appointments')
      const usersCollection = database.collection('users')

      app.post('/users' , async(req,res)=>{
        const user = req.body;
        const result = await usersCollection.insertOne(user)
        console.log(result);
        res.json(result)
        
      })

      app.get('/users/:email',async(req,res)=>{
        const email = req.params.email;
        const query = {email:email}
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if(user?.role === 'admin'){
          isAdmin=true;
        }
        res.json({admin:isAdmin});
      })

      app.put('/users' , async(req,res)=>{
        const user = req.body;
        const filter = {email:user.email};
        const options = { upsert:true }
        const updateDoc = { $set:user };
        const result =  await usersCollection.updateOne(filter,updateDoc,options)
        // console.log(result);
        res.json(result)
      })

      app.put('/users/admin' , async(req,res)=>{
        const user = req.body;
        console.log('put' , user);
        const filter = {email: user.email}
        const updateDoc = {$set:{role:'admin'}};
        const result = await usersCollection.updateOne(filter,updateDoc)
        res.json(result);
      })

      app.get('/appointments' , async (req,res) =>{
        const email = req.query.email;
        const date = new Date(req.query.date).toDateString();
        console.log(date);
        const query ={email:email , date:date}
        const cursor = appointmentCollection.find(query)
        const result = await cursor.toArray()
        res.json(result)
      })

      app.get('/allAppointments',async(req,res)=>{
        const allOrders = appointmentCollection.find({})
        const result = await allOrders.toArray()
        res.send(result);
      })
     


      app.post('/appointments' , async (req,res) => {
        const appointment = req.body;
        const result = await appointmentCollection.insertOne(appointment)
        console.log(result);
        res.json(result);
      })

      app.delete('/appointments/:id',async(req,res)=>{
        console.log(req.params);
        const id = req.params.id;
        const query = {_id:ObjectId(id)};
        console.log((query));
        const result = await appointmentCollection.deleteOne(query);
        res.json(result);
    })

    app.put('/allAppointments/:id' , async(req,res)=>{
      const id = req.params.id;
       const updatedStatus = req.body.status;
       const filter = { _id: ObjectId(id) };
       console.log(updatedStatus);
       appointmentCollection
         .updateOne(filter, {
           $set: { status: updatedStatus },
         })
         .then((result) => {
           res.send(result);
         });
     });

     
      
    } finally {
      // Ensures that the client will close when you finish/error
    }
  }
  run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello Doctors!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})