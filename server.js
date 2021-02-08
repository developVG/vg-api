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
    

app.post('/uploadmultiple', upload.array('myFiles', 12), (req, res, next) => {
  const files = req.files
  if (!files) {
    const error = new Error('Please choose files')
    error.httpStatusCode = 400
    return next(error)
  }

    res.send(files)
 
})


app.listen(PORT, hostname, () => {
    console.log("---SERVER RUNNING---");
});

