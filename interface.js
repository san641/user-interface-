const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3001;


const mongoURI = 'mongodb://localhost:27017';
const dbName = 'companies';
const collectionName = 'source';


app.use(express.urlencoded({ extended: true }));


let db;
MongoClient.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    db = client.db(dbName);
  })
  .catch(error => console.error(error));




app.get('/', async (req, res) => {
  const sources = await db.collection(collectionName).find().toArray();
  let html = '<h1>Sources</h1>';
  html += '<ul>';
  sources.forEach(source => {
    html += `
      <li>
        ${source.source} - ${source.url}
        <a href="/edit/${source.id}">Edit</a>
        <a href="/delete/${source.id}">Delete</a>
      </li>
    `;
  });
  html += '</ul>';
  html += '<h2>Add New Source</h2>';
  html += `
    <form action="/add" method="POST">
      <label>Source: <input type="text" name="source" required /></label><br />
      <label>URL: <input type="url" name="url" required /></label><br />
      <button type="submit">Add Source</button>
    </form>
  `;
  res.send(html);
});

app.post('/add', async (req, res) => {
  const { source, url } = req.body;
  const id = new Date().getTime();  
  await db.collection(collectionName).insertOne({ id, source, url });
  res.redirect('/');
});


app.get('/edit/:id', async (req, res) => {
  const source = await db.collection(collectionName).findOne({ id: parseInt(req.params.id) });
  let html = '<h1>Edit Source</h1>';
  html += `
    <form action="/edit/${source.id}" method="POST">
      <label>Source: <input type="text" name="source" value="${source.source}" required /></label><br />
      <label>URL: <input type="url" name="url" value="${source.url}" required /></label><br />
      <button type="submit">Update Source</button>
    </form>
  `;
  res.send(html);
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
});git

