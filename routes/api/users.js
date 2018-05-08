const express = require("express")
const router = express.Router()
const bycrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const keys = require('../../config/keys')
const passport = require('passport')
//Load user model
const User = require('../models/User')
//@route  GET api/users/test
//@desc   Tests profile routes
//access  Public
router.get('/test', (req, res) => {
  res.json({msg: "Users Works"})
})
//@route  POST api/users/register
//@desc   Register a user
//access  Public
router.post('/register', (req, res) => {
  const { email, name, avatar, password } = req.body
  User.findOne({ email })
      .then(user => {
        if(user) {
          return res.status(400).json({
            email: 'Email already exists'
          })
        } else {
          const newUser = new User({
            name,
            email,
            avatar,
            password
          })
          bycrypt.genSalt(10, (err, salt) => {
            bycrypt.hash(newUser.password, salt, (err, hash) => {
              if(err) throw err;
              newUser.password = hash;
              newUser.save()
                .then(user => res.json(user))
                .catch(err => console.log(err))
            })
          })
        }
      })
})
//@route  POST api/users/register
//@desc   Register a user
//access  Public
router.post('/login',(req, res) => {
  const { email, password } = req.body
  User.findOne({email}).then(user => {
    //Check for user
    if(!user)
      return res.status(400).json({email: 'User not found'})
    //Check password
    bycrypt.compare(password, user.password)
    .then(isMatch => {
        if(isMatch){
          //User Matched
          const payload = {
            id: user.id,
            name: user.name,
            avatar: user.avatar
          }//Create JWT payload
          //Sign Token
          jwt.sign(payload,
            keys.secretOrKey,
            { expiresIn: 3600 },
            (err, token) => {
              res.json({
                success: true,
                token: 'Bearer ' + token
              })
          })
        } else {
          return res.status(400).json({password: 'Password Icorrect'})
        }
    })
  })
})
//@route  POST api/users/current
//@desc   Returns current user
//access  Private
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({
    id:req.user.id,
    name: req.user.name,
    email: req.user.email
  })
})
module.exports = router
