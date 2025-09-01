require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(express.urlencoded());
app.use(express.json());



app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

let urlcounter = 1;

const urlSchema = new Schema ({
  original_url: {type: String, required: true},
  short_url: {type: Number}
})

let urlModel;

urlModel = mongoose.model('urlModel', urlSchema);

app.post('/api/shorturl', (req, res) => {
  try {
    const originalUrl = req.body.url;
    const parsedUrl = new URL(originalUrl)
    const domain = parsedUrl.hostname;   
    
    dns.lookup(domain, async (err, address) => {
      if(err) {
        return res.json({error: 'invalid url'})
      }
      const newUrl = new urlModel ({
        original_url: originalUrl,
        short_url: urlcounter
      })
      const savedUrl = await newUrl.save();
      urlcounter++;
      return res.status(200).json({
        original_url: savedUrl.original_url,
        short_url: savedUrl.short_url
      })
    })
  } catch (error) {
    res.json({err: error.message})
  }
})

app.get('/api/shorturl/:short_url', async (req, res) => {
  try {
    const shortUrl = parseInt(req.params.short_url);

    const urlObj = await urlModel.findOne({short_url: shortUrl});

    if(!urlObj) {
      return res.json({error: "can't find the url"})
    }

    const redirectUrl = urlObj.original_url;

    return res.redirect(redirectUrl);  
  } catch (error) {
    res.status(500).json({error: error.message})
  }
  
  
})



app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
