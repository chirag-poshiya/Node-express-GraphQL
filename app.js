const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const mongoose = require('mongoose');
const graphqlSchema = require('./graphql/schema');
const  graphqlHttp  = require('express-graphql').graphqlHTTP;
const graphqlResolver = require('./graphql/resolvers');
const auth = require('./middleware/auth');
const { clearImage } = require('./util/file')

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  if(req.method === "OPTIONS"){
    return res.sendStatus(200);
  }
  next();
});

app.use(auth);

app.put('/post-image', (req, res, next) => {
  if(!req.isAuth){
    throw new Error("Unauthenticated!")
  }
  if(!req.file){
    return res.status(200).json({message: "No file provided"});
  }
  if(req.body.oldPath){
    clearImage(req.body.oldPath);
  }
  return res.status(201).json({ message: "File stored.", filePath: req.file.path })


})


app.use('/graphql', graphqlHttp({
  graphiql:true,
  rootValue: graphqlResolver,
  schema: graphqlSchema,
  formatError(err){
    if(!err.originalError){
      return err;
    }
    const message = err.message || "An error occured."; // error message
    const data = err.originalError.data;
    const code = err.originalError.code || 500;
    return {message: message, status: code, data: data}
  } 
}));

app.use((error, req, res, next) => {
  // console.log(error);
  const data = error.data;
  const message = error.message;
  const status = error.statusCode || 500;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(
    'mongodb://localhost:27017/messages', {useNewUrlParser: true, useUnifiedTopology: true} // connect mongodb
  )
  .then(result => {
    app.listen(8080);
    
    
  })
  .catch(err => console.log(err));

