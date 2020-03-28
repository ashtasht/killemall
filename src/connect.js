const fs = require('fs');

const Koa = require('koa');
const koaJwt = require('koa-jwt');
const jsonWebToken = require('jsonwebtoken');
const bcrypt = require('bcrypt')

const config = require('../config.json');

const app = new Koa();

app.use(async (ctx) => {
  if (!ctx.request.body.key) {
    ctx.status = 400;
    return;
  }

  var promises = [];

  for (i = 0; i < config.keys.length; i++) {
    promises.push(new Promise((resolve, reject) => {
      if (bcrypt.compareSync(ctx.request.body.key, config.keys[i].hash))
        resolve(config.keys[i].roles);
      else
        resolve(false);
    }));
  }
  
  var v = await Promise.all(promises);
  for (i = 0; i < v.length; i++) {
    if (v[i] != false) {
      ctx.body = {
        token: jsonWebToken.sign({data: { roles: config.keys[i] }}, 'secret')
      };
      return;
    }
  }
  ctx.status = 401;
});

module.exports = app;
