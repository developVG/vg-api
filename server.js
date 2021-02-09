const express = require('express');
const multer = require('multer');

const upload = multer({ dest: __dirname + '/uploads/images' });

const app = express();
const hostname = '10.10.1.207';
const PORT = 3000;

var Connection = require('tedious').Connection;
var TYPES = require('tedious').TYPES;
var Request = require('tedious').Request

app.use(express.static('public'));


app.post('/uploadmultiple', upload.any(), (req, res, next) => {
  console.log(req.body);
  
  res.status(200).send(req.body);
})



app.listen(PORT, hostname, () => {
  console.log("---SERVER RUNNING---");
});
