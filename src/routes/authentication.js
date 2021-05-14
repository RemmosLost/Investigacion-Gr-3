const express = require('express');
const router = express.Router();
const uuid = require('uuid')
const bcrypt = require('bcryptjs')
const cors = require('cors')
const collection = require('../database').collection;
const passport = require('passport');
const {isAuthenticated} = require('../helpers/auth');

router.get('/', (req, res) => {
    res.render('auth/authentication');
});

router.get('/userinfo',isAuthenticated, (req, res) => {
  res.render('auth/userInfo');
});

// create account
router.post('/account', async (request, response) => {
    if (!request.body.email && !request.body.password) {
      request.flash('message','Debe tener un usuario y una contraseña');
      return response.redirect('/auth');
    } else if (!request.body.email || !request.body.password) {
      request.flash('message','No debe faltar ni usuario ni contraseña');
      return response.redirect('/auth');
    }
  
    const id = uuid.v4()
    const account = {
      "type": "account",
      "pid": id,
      "email": request.body.email,
      "password": bcrypt.hashSync(request.body.password, 10)
    }
    const profile = {
      "type": "profile",
      "email": request.body.email,
      "name": request.body.name,
      "lastname": request.body.lastname
    }
  
    await collection.insert(id, profile)
      .then(async () => {
        await collection.insert(request.body.email, account)
          .then((result) => {
            result.pid = id
            request.flash('message','Usuario registrado');
            return response.redirect('/auth');
          })
          .catch(async (e) => {
            await collection.remove(id)
              .then(() => {
                console.error(`account creation failed, removed: ${id}`)
                return response.status(500).send(e)
              })
              .catch(e => response.status(500).send(e))
          })
      })
      .catch(e => response.status(500).send(e))
  });
  
  // login user endpoint
  router.post('/login', passport.authenticate('local',{
    successRedirect: '/notes' ,
    failureRedirect: '/auth',
    failureFlash: true
  }));
  
  router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});
  
// get profile endpoint (bonus example, not covered in tutorial)
router.get("/profile/:pid", async(request, response) => {
  try {
    const result = await collection.get(request.params.pid)
    response.send(result)
  } catch (e) {
    return response.status(500).send(e.message)
  }
})
module.exports = router;