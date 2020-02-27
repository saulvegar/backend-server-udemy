var express = require('express');

var app = express();

const path = require('path');
const fs = require('fs');

app.get('/:tipo/:img', (req, res, next) => {

  var { tipo, img } = req.params;

  var pathImagen = path.resolve(__dirname, `../uploads/${tipo}/${img}`);

  if (fs.existsSync(pathImagen)) {
    res.sendFile(pathImagen);
  } else {
    var pathNoImagen = path.resolve(__dirname, '../assets/no-img.jpg');
    res.sendFile(pathNoImagen);
  }
});


module.exports = app;