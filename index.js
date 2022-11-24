const express = require('express')
const cors = require('cors');
require('dotenv').config();
const { query } = require('express');

const { MongoClient, ServerApiVersion } = require('mongodb');
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

        app.post('/jwt', async(req, res) =>{
            const user = req.body;
            console.log(user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1d'});
            res.send({token});
        })
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