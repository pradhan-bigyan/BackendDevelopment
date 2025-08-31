require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(express.urlencoded);


app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});



let urlcounter = 1;

app.post('/api/shorturl', (req, res) => {
  const url = req.body.url;

  if(!url && !isValidUrl(url)) {
    res.json({
      error: 'invalid url'
    })
  }
  else {
    urlcounter++;
    res.json({
      original_url : url,
      short_url: urlcounter
    })
  }
})



app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
