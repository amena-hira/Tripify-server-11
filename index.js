const express = require('express')
const cors = require('cors');
require('dotenv').config();
const { query } = require('express');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

const app = express()
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json())

user = process.env.DB_USER;
password = process.env.DB_PASSWORD;

const uri = `mongodb+srv://${user}:${password}@cluster0.cwbwt8c.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const serviceCollection = client.db('tripify').collection('services');

        // jwt token
        app.post('/jwt', async(req, res) =>{
            const user = req.body;
            console.log(user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1d'});
            res.send({token});
        })

        // service db
        // limit3
        app.get('/services', async(req, res)=>{
            const size = 3;
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.limit(size).toArray();
            res.send(services);
        })
        // all
        app.get('/allservices', async(req, res)=>{
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })
        // one
        app.get('/services/:id', async(req,res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const service = await serviceCollection.findOne(query);
            res.send(service);
        })
        // add
        app.post('/services', async(req, res) =>{
            const service = req.body;
            console.log(service);
            const result = await serviceCollection.insertOne(service);
            res.send(result);
        })
        
    }
    finally{

    }
}
run().catch(error => console.log(error));

app.get('/', (req, res) => {
  res.send('Tripify server is running!')
})

app.listen(port, () => {
  console.log(`Tripify app listening on port ${port}`)
})