const express = require('express');
const cors = require('cors');
require('dotenv').config();

const jwt = require('jsonwebtoken');

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

// _________________________________________________
// __________________________ JWT verify ______________
function verifyJwt(req, res, next) {
    const authheader = req.headers.authorization;
    if (!authheader) {
        return res.status(401).send({ message: 'auth header nai' })
    }
    const token = authheader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(401).send({ message: 'get err while verifying' })
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {
        // _________________________________________________
        // __________________________SERVICES ______________
        const servicesCollection = client.db('bakery').collection('services');
        // Read services ------------- GET services
        app.get('/services', async (req, res) => {
            const query = {};
            const limit = req.query.limit ? parseInt(req.query.limit) : 0;

            const cursor = servicesCollection.find(query);
            const services = await cursor.limit(limit).toArray();
            res.send(services);
        })
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await servicesCollection.findOne(query);
            res.send(service);
        })
        //  create services ---------- POST services
        app.post('/services', async (req, res) => {
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
        app.get('/reviews', verifyJwt, async (req, res) => {
            let query = {};
            if (req.query.email) {
                query = { "userInfo.email": req.query.email }
                // query = { "userInfo" : {email : req.query.email}} // its wrong -_-
            }
            if (req.query.id) {
                query = { "_id": ObjectId(req.query.id) }
            }
            if (req.query.serviceId) {
                query = { "serviceInfo._id": req.query.serviceId }
            }
            const sort = { _id: -1 };
            const cursor = reviewsCollection.find(query).sort(sort);
            const reviews = await cursor.toArray();
            // console.log(reviews)
            res.send(reviews)
        })
        //  create reviews ---------- POST reviews
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const review_withTime = {
                $setOnInsert: { time: new Date() }
            }
            console.log('reviews in server from client body ', review);
            const result = await reviewsCollection.insertOne(review);
            console.log(result);
            res.send(result);
        })
        // update reviews ------------- update
        app.put('/reviews/:id', async (req, res) => {
            const filter = { "_id": ObjectId(req.params.id) };
            const updateReview = req.body;
            const updatedReview = {
                $set: {
                    review: updateReview.review,
                    userInfo: updateReview.userInfo,
                    serviceInfo: updateReview.serviceInfo
                },
                $setOnInsert: { time: new Date() }
            }
            console.log(updatedReview);
            const result = await reviewsCollection.updateOne(filter, updatedReview);
            res.send(result);
        })

        // delete reviews ------------- DELETE
        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewsCollection.deleteOne(query);
            res.send(result);
        })

        // _____________________________________________________
        // __________________________ BLOGS ______________
        const blogsCollection = client.db('bakery').collection('blogs');
        app.get('/blogs', async (req, res) => {
            const query = {};
            const cursor = blogsCollection.find(query);
            const blogs = await cursor.toArray();
            res.send(blogs)
        })

        // _____________________________________________________
        // __________________________ J W T ______________
        app.post('/jwt', (req, res) => {
            const user = req.body;
            console.log(user);
            const token = jwt.sign(
                user,
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '1hr' }
            )
            res.send({ token })
        })


    } finally {

    }
}
run().catch(console.dir)

// --------------------------------------------

app.get('/', (req, res) => {
    res.send('bekar-i server chalu hain bhai')
})


// app.get('/services/:id', (req,res)=>{
//     const id = req.params.id;
//     const service = services.filter(service => service.c_id == id)
//     res.json(service);
// })

app.listen(port, () => {
    console.log(`listening you from port ${port}`)
})