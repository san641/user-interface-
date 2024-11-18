const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3004;

const mongoURI = 'mongodb://localhost:27017';
const dbName = 'companies';
const collectionName = 'source';


app.set('view engine', 'pug');
app.set('views', './views'); 

app.use(express.urlencoded({ extended: true }));

let db;
MongoClient.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    db = client.db(dbName);
  })
  .catch(error => console.error(error));


app.get('/', async (req, res) => {
  const sources = await db.collection(collectionName).find().toArray();
  res.render('index', { sources });
});


app.post('/add', async (req, res) => {
  const { source, url } = req.body;
  const id = new Date().getTime(); 
  await db.collection(collectionName).insertOne({ id, source, url });
  res.redirect('/');
});


app.get('/edit/:id', async (req, res) => {
  const source = await db.collection(collectionName).findOne({ id: parseInt(req.params.id) });
  res.render('edit', { source });
});


app.post('/edit/:id', async (req, res) => {
  const { source, url } = req.body;
  await db.collection(collectionName).updateOne(
    { id: parseInt(req.params.id) },
    { $set: { source, url } }
  );
  res.redirect('/');
});


app.get('/delete/:id', async (req, res) => {
  await db.collection(collectionName).deleteOne({ id: parseInt(req.params.id) });
  res.redirect('/');
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
