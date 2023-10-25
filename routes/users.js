const mongoose = require('mongoose');
const router = require('express').Router();   
const User = mongoose.model('User');
// const passport = require('passport');
const utils = require('../lib/utils');

// TODO
router.get('/protected', utils.authMiddleware, (req, res, next) => {
    console.log(req.jwt);
    res.status(200).json({success: true, msg: 'You are successfully authenticated to this route!'});
});

// TODO
router.post('/login', function(req, res, next){
    User.findOne({username: req.body.username})
    .then((user) => {
        if(!user){
            res.status(401).json({success: false, msg: 'Could not find user.'});
        }
        const isValid = utils.validPassword(req.body.password, user.hash, user.salt);

        if(isValid){
            const tokenObject = utils.issueJWT(user);

            res.status(200).json({success: true, msg: 'Logged In Successfully!', user: user, token: tokenObject.token, expiresIn: tokenObject.expires});
        } else {
            res.status(401).json({success: false, msg: 'You entered the wrong password.'});
        }
    });
});

// TODO
router.post('/register', function(req, res, next){
    User.findOne({username: req.body.username})
    .then((user) => {
        if(user){
            res.json({success: false, msg: 'Username already exists.'});
        }
        else{

            const saltHash = utils.genPassword(req.body.password);

            const salt = saltHash.salt;
            const hash = saltHash.hash;

            const newUser = new User({
                username: req.body.username,
                hash: hash,
                salt: salt
            });

            newUser.save()
            .then((user) => {
                    const jwt = utils.issueJWT(user);

                    console.log(user);
                    res.json({success: true, msg: 'Successful created new user.', user: user, token: jwt.token, expiresIn: jwt.expires});
            })
            .catch(err => {
                    console.log(err);
                    res.json({success: false, msg: 'Error creating new user.'});
                    next(err);
            });
        }
    });
});

module.exports = router;