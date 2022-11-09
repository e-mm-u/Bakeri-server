const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

// creating express app
const app = express();

// using middleware
app.use(express.json());
app.use(cors());
// dbuser = 
// pass = fni1rKk6eSEqLFKy
const services = require('./data/servicedata.json');


// ------------- mongo ------------------------

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.PASSWORD}@bakery-cluster0.f1fssst.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        // _________________________________________________
        // __________________________SERVICES ______________
        const servicesCollection = client.db('bakery').collection('services');
        // Read services ------------- GET services
        app.get('/services', async(req,res)=>{
            const query = {};
            const cursor = servicesCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })
        app.get('/services/:id', async(req,res)=>{
            const id = req.params.id;
            const query = { _id : ObjectId(id) };
            const service = await servicesCollection.findOne(query);
            res.send(service);
        })
        //  create services ---------- POST services
        app.post('/services', async(req,res)=>{
            const service = req.body;
            console.log('services in server from client body ', service)
            const result = await servicesCollection.insertOne(service);
            console.log(result)
            res.send(result);
        })
        // _____________________________________________________
        // __________________________ REVIEWS ______________
        const reviewsCollection = client.db('bakery').collection('reviews');
        // read reviews ------------ GET reviews
        app.get('/reviews', async(req,res)=>{
            let query = {};
            if( req.query.email){
                query = { "userInfo.email" : req.query.email}
                // query = { "userInfo" : {email : req.query.email}} // its wrong -_-
            }
            const cursor = reviewsCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews)
        })
        //  create reviews ---------- POST reviews
        app.post('/reviews', async(req,res)=>{
            const review = req.body;
            console.log('reviews in server from client body ', review);
            const result = await reviewsCollection.insertOne(review);
            console.log(result);
            res.send(result);
        })
        // get reviews for individual user - My_Reviews
        app.get('/reviews/:userId', async(req,res)=>{
            const userId = req.params.userId;
            const query = { uid : userId };
            const cursor = reviewsCollection.find(query);
            const reviews = await cursor.toArray() ;
            res.send(reviews)
        })

        
        

    }finally{

    }
}
run().catch(console.dir)

// --------------------------------------------

app.get('/', (req,res) => {
    res.send('bekar-i server chalu hain bhai')
})


// app.get('/services/:id', (req,res)=>{
//     const id = req.params.id;
//     const service = services.filter(service => service.c_id == id)
//     res.json(service);
// })

app.listen(port, ()=>{
    console.log(`listening you from port ${port}`)
})