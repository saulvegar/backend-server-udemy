var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var app = express();
var Usuario = require('../models/usuario');
var SEED = require('../config/config').SEED;

// Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);


app.post('/', (req, res) => {

  var body = req.body;

  Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar usuario',
        errors: err
      });
    }

    if (!usuarioDB) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Credenciales incorretas - email',
        errors: err
      });
    }

    if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Credenciales incorrectas - password',
        errors: err
      });
    }

    delete usuarioDB.password
    var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

    res.status(200).json({
      ok: true,
      usuario: usuarioDB,
      id: usuarioDB._id,
      token
    });
  });

});


// Autenticacion de Google
async function verify(token) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  // const userid = payload['sub'];
  // If request specified a G Suite domain:
  //const domain = payload['hd'];
  return {
    nombre: payload.name,
    emial: payload.email,
    img: payload.picture,
    google: true,
  }
}

app.post('/google', async (req, res) => {

  var token = req.body.token;
  var googleUser = await verify(token).catch(e => {
    return res.status(403).json({
      ok: false,
      mensaje: 'Token no válido'
    })
  });


  Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar usuario',
        errors: err
      });
    }

    if (usuarioDb) {
      if(usuarioDb.google === false) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Debe de usar su autenticación normal',
          errors: err
        });
      } else {
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

        res.status(200).json({
          ok: true,
          usuario: usuarioDB,
          id: usuarioDB._id,
          token
        });
      }
    } else {
      // El usuario no existe... hay que crearlo
      var usuario = new Usuario();

      usuario.nombre = googleUser.nombre;
      usuario.email = google.email;
      usuario.img = google.img;
      usuario.google = true;
      usuario.password = ':)';

      usuario.save((err, usuarioDB) => {
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

        res.status(200).json({
          ok: true,
          usuario: usuarioDB,
          id: usuarioDB._id,
          token
        });
      });
    }
  });

  res.status(200).json({
    ok: true,
    mensaje: 'OK!',
    googleUser
  });
});




module.exports = app;