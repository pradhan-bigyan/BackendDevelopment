const express = require('express')
const mongoose = require('mongoose')
const app = express()
const cors = require('cors')
const Schema = mongoose.Schema;
require('dotenv').config()

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors())
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded())
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

let Exercise;
let User;

const exerciseSchema = new Schema ( {
  username: {type: String, required: true},
  description: {type: String, required: true},
  duration: Number,
  date: {type: Date, default: Date.now},
})

Exercise = mongoose.model('Exercise', exerciseSchema)

const userSchema = new Schema ({
  username: {type: String, required: true}
})

User = mongoose.model('User', userSchema)

app.post('/api/users', async (req, res) => {
  try {
    const uName = req.body.username;
    const newUser = new User({ username: uName });
    const savedUser = await newUser.save();
    res.json(savedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({error: error.message})
  }
})

app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    const id = req.params._id;
    const desc = req.body.description;
    const duration = parseInt(req.body.duration);
    let date;
    let d;
    if(!req.body.date){
      date = new Date();
      d = date.toDateString();
    }
    else {
      date = new Date(req.body.date);
      d = date.toDateString();
    }
    const user = await User.findById(id)
    if(!user) {
      res.status(404).json({error: 'User not found'})
    }
    const newExercise = new Exercise({
      username: user.username,
      description: desc,
      duration: duration,
      date: d
    })

    const savedExercise = await newExercise.save();
    res.json({
      _id: user._id,
      username: user.username,
      date: d,
      duration: duration,
      description: desc
    });
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const id = req.params._id;
    const {from, to, limit} = req.query;
    const user = await User.findById(id);

    if(!user) {
      return res.status(400).json({error: "can't find user with the id"})
    }

    const query = {username: user.username};
    if(from || to) {
      query.date = {};
      if(from){
        const fromDate = new Date(from)
        query.date.$gte = fromDate;
      }
      if(to) {
        const toDate = new Date(to)
        query.date.$lte = toDate;
      }
    }

    const count = await Exercise.countDocuments(query);
    let exerciseQuery = Exercise.find(query);

    if(limit) {
      exerciseQuery = exerciseQuery.limit(parseInt(limit));
    }

    const exercise = await exerciseQuery.exec();

    res.status(200).json({
      username: user.username,
      count: count,
      _id: user._id,
      log: exercise.map(info => ({
        description: info.description,
        duration: info.duration,
        date: info.date.toDateString()
      }))
    })

  } catch (error) {
    res.status(500).json({error: error.message})
  }
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
