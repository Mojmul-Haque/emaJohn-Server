const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()
const MongoClient = require('mongodb').MongoClient
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zd8xq.mongodb.net/${process.env.DB_DATABASE}?retryWrites=true&w=majority`
const app = express()
app.use(cors())
app.use(bodyParser.json())

// console.log(process.env.DB_COLLECTION)

app.get('/', (req, res)=>{
  res.send('Mongo Db and all file working')
})

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
client.connect(err => {
  const productsCollection = client
    .db(`${process.env.DB_DATABASE}`)
    .collection(`${process.env.DB_COLLECTION}`)
  const ordersCollection = client
    .db(`${process.env.DB_DATABASE}`)
    .collection('order')

  app.post('/addProduct', (req, res) => {
    const product = req.body
    productsCollection.insertMany(product).then(result => {
      console.log(result.insertedCount)
      res.send(result.insertedCount)
    })
  })
  // read data crud
  app.get('/products', (req, res) => {
    productsCollection.find({}).toArray((err, documents) => {
      res.send(documents)
    })
  })

  app.get('/product/:key', (req, res) => {
    console.log(req.params.key)
    productsCollection
      .find({ key: req.params.key })
      .toArray((err, documents) => {
        res.send(documents[0])
      })
  })

  app.post('/productByKeys', (req, res) => {
    const productKeys = req.body
    productsCollection
      .find({ key: { $in: productKeys } })
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  app.post('/addOrder', (req, res) => {
    ordersCollection.insertOne(req.body).then(result => {
      res.send(result.insertedCount > 0)
    })
  })
})

app.listen(process.env.PORT || 5000)
