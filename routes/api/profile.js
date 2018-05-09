const express = require("express")
const router = express.Router()
const mongoose = require('mongoose');
const passport = require('passport');
//Load Profile Model
const Profile = require('../models/Profile')
//Load Profile User
const User = require('../models/User')
//@route  GET api/profile/test
//@desc   Tests profile routes
//access  Public
router.get('/test', (req, res) => {
  res.json({msg: "Profile Works"})
})
//@route  GET api/profile/
//@desc   Ger users profile
//access  Private
router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
  const errors = {}
  Profile.findOne({user: req.user.id}).then(profile => {
    if(!profile) {
      errors.noprofile = 'There is no profile for this user'
      return res.status(400).json(errors)
    }
    res.json(profile)
  })
  .catch(err =>  res.status(404).json(err))
})
//@route  POST api/profile/
//@desc   Create or edit users profile
//access  Private
router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
  //Get Fields
  const profileFields = {}
  profileFields.user = req.user.id
  if(req.body.handle) profileFields.hanlde = req.body.handle
  if(req.body.company) profileFields.company = req.body.company
  if(req.body.website) profileFields.website = req.body.website
  if(req.body.location) profileFields.location = req.body.location
  if(req.body.bio) profileFields.bio = req.body.bio
  //social
  profileFields.social = {}
  if(req.body.youtube) profileFields.social.youtube = req.body.youtube
  if(req.body.twitter) profileFields.social.twitter = req.body.twitter
  if(req.body.facebook) profileFields.social.facebook = req.body.facebook
  if(req.body.linkdin) profileFields.social.linkdin = req.body.linkdin
  if(req.body.instagram) profileFields.social.instagram = req.body.instagram
  Profile.findOne({user: req.user.id})
    .then(profile => {
      if(profile) {
        // Update
        Profile.findOneAndUpdate(
          {user: req.user.id},
          {$set: profileFields},
          {new:true}
        ).then(profile => rs.json(profile))
      } else {
        // Create
        //Check if handle exists
        Profile.findOne({hanlde: profileFields.handle}).then(profile => {
          if(profile) {
            errors.hanlde = 'That handle already exists'
            res.status(400).json(errors)
          }
          //Save profile
          new Profile(profile).save().then(profile => res.json(profile))
        })
      }
    })
})
module.exports = router
