const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const User = require('../models/users')

router.get('/', (req,res) => {
    res.render('sessions/about')
})

router.get('/register', (req,res) => {
    res.render('sessions/register')
})

router.post('/register', async(req,res,next) => {
    try{
        console.log(req.body)
        if(req.body.password === req.body.verifyPassword){
            const existingUser = await User.findOne({username: req.body.username})
            if(existingUser){
                req.session.message = 'Username is already in use, Please try again!'
                res.redirect('/session/register')
            } else {
                const salt = bcrypt.genSaltSync(10)
                const hashedPassword = bcrypt.hashSync(req.body.password, salt)

                req.body.password = hashedPassword
                req.session.loggedIn = true
                const createdUser = await User.create(req.body)
                console.log(createdUser)
                req.session.username = createdUser.username
                res.redirect('/user/update')
            }
        } else {
            req.session.message = 'Passwords Must Match'
            res.redirect('/session/register')
        }
    }catch(err){
        next(err)
    }
})

router.get('/login', (req,res) => {
    res.render('sessions/login')
})

router.post('/login', async(req,res,next) => {
    try{
        const userToLogin = await User.findOne({username: req.body.username})
        if(userToLogin){  
            const validPassword = bcrypt.compareSync(req.body.password, userToLogin.password)
            if(validPassword){
                req.session.username = userToLogin.username
                req.session.loggedIn = true
                console.log('Come back to session login post route to change the redirect to calendar/quickadd once route is built')
                res.redirect('/user')
            } else {
                req.session.message = 'Invalid Username or Password'
                res.redirect('/session/login')
            }
        }else {
            req.session.message = 'Invalid Username Or Password'
            res.redirect('/session/login')
        }
    }catch(err){
        next(err)
    }
})

router.get('/logout', (req,res) => {
    req.session.destroy()
    res.redirect('/session/login')
})

module.exports = router