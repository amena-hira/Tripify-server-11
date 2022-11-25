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

function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({message: 'unauthorized access'});
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(401).send({message: 'unauthorized access'});
        }
        req.decoded = decoded;
        next();
    })
}

async function run(){
    try{
        const serviceCollection = client.db('tripify').collection('services');
        const reviewCollection = client.db('tripify').collection('reviews');

        // jwt token
        app.post('/jwt', async(req, res) =>{
            const user = req.body;
            console.log(user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1d'});
            res.send({token});
        })

        // service db
        // limit3 service
        app.get('/services', async(req, res)=>{
            const size = 3;
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.limit(size).toArray();
            res.send(services);
        })
        // all service
        app.get('/allservices', async(req, res)=>{
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })
        // one service
        app.get('/services/:id', async(req,res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const service = await serviceCollection.findOne(query);
            res.send(service);
        })
        // add service
        app.post('/services', async(req, res) =>{
            const service = req.body;
            console.log(service);
            const result = await serviceCollection.insertOne(service);
            res.send(result);
        })

        // --------Review-------
        // all Review
        app.get('/reviews', async(req, res)=>{
            const query = {};
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        })
        // one review
        app.get('/reviews/:id', async(req,res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const review = await reviewCollection.findOne(query);
            res.send(review);
        })
        // add Review
        app.post('/reviews', async(req, res) =>{
            const review = req.body;
            console.log(review);
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        })
        // update review
        app.patch('/reviews/:id', async(req, res) =>{
            const id = req.params.id;
            const reviewText = req.body.reviewText;
            const query = {_id: ObjectId(id)};
            const updateDoc = {
                $set:{
                    reviewText: reviewText
                }
            }
            // console.log(updateDoc);
            const result = await reviewCollection.updateOne(query, updateDoc);
            res.send(result);
        })
        // delete Review
        app.delete('/reviews/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        })


        // Service based one Review
        app.get('/service/reviews/:id', async(req,res) =>{
            const id = req.params.id;
            const query = {service: id}
            console.log(query);
            const cursor = await reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        })
        // user Based Review
        app.get('/user/review', verifyJWT, async (req,res) =>{
            const decoded = req.decoded;
            console.log('inside api: ', decoded);
            let query = {};
            if (decoded.email !== req.query.email) {
                res.status(403).send({message: 'unauthorized accesss'})
            }
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            console.log(req.query.email);
            const cursor = reviewCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
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