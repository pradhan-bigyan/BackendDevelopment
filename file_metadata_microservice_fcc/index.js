var express = require('express');
var cors = require('cors');
var multer = require('multer');
require('dotenv').config()
var app = express();


var upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.urlencoded());
app.use(express.json());

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


app.post('/api/fileanalyse', upload.single('upfile'), (req, res) => {
  const nameOfFile = req.file.originalname;
  const typeOfFile = req.file.mimetype;
  const sizeOfFile = req.file.size;

  res.status(200).json({
    name: nameOfFile,
    type: typeOfFile,
    size: sizeOfFile
  })
})



const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});
