const express = require("express")
const router = express.Router()
const bycrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const keys = require('../../config/keys')
const passport = require('passport')
//Load Input Validation
const validateRegisterInput = require('../../validation/register')
const validateLoginInput = require('../../validation/login')
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
  const {errors, isValid} = validateRegisterInput(req.body)
  //Check Validation
  if(!isValid) {
    return res.status(400).json(errors)
  }
  console.log('passed')
  const { email, name, avatar, password } = req.body
  User.findOne({ email })
      .then(user => {
        if(user) {
          errors.email = 'Email already exists'
          return res.status(400).json(errors)
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
  const {errors, isValid} = validateLoginInput(req.body)
  //Check Validation
  if(!isValid) {
    return res.status(400).json(errors)
  }
  const { email, password } = req.body
  //Find user by email
  User.findOne({email}).then(user => {
    //Check for user
    if(!user) {
      errors.email = 'User not found'
      return res.status(400).json(errors)
    }//Check password
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
          errors.password = 'Password Incorrect'
          return res.status(400).json(errors)
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
