const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const collection = require('../database').collection;
const uuid = require('uuid')
const bcrypt = require('bcryptjs')

passport.use(new LocalStrategy({
    usernameField: 'email'
}, async (email,password,done) => {
   try { const user = await collection.get(email);
    if(!user){
        return done(null,false, {message: 'No se encontro ese usuario'})
    }else if(!bcrypt.compareSync(password, user.value.password)) {
          return done(null, false, {message: 'Contraseña incorrecta'});
    }else{
        return done(null, user);
    }
}catch (e) {
    return done(null,false, {message: 'No se encontro ese usuario'});
}
}));

passport.serializeUser((user,done) =>{
    done(null,user.value.pid);
});

passport.deserializeUser((pid,done) =>{
    collection.get(pid, (err,user) => {
        done(err,user);
    });
});