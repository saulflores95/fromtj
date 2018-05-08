const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const passport = require('passport') // main auth module

const users = require('./routes/api/users')
const profile = require('./routes/api/profile')
const posts = require('./routes/api/posts')

const app = express()
//  Body parser middleware
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
// DB Config
const db = require(('./config/keys')).mongoURI
// Connect to MongoDB
mongoose.connect(db)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err))
// Pasport middleware
app.use(passport.initialize())
// Passport Config
require('./config/passport')(passport)
// Use Routes
app.use('/api/users', users)
app.use('/api/profile', profile)
app.use('/api/posts', posts)

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`Server running on PORT: ${port}`)
})
