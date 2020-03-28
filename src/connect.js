const fs = require("fs");

const Koa = require("koa");
const koaJwt = require("koa-jwt");
const jsonWebToken = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const config = require("../config.json");

const app = new Koa();

app.use(async (ctx) => {
  if (!ctx.request.body.key) {
    ctx.status = 400;
    return;
  }

  var promises = [];

  for (var i = 0; i < config.keys.length; i++) {
    try {
      promises.push(bcrypt.compareSync(ctx.request.body.key, config.keys[i].hash));
    } catch {
      promises.push(null);
      ctx.status = 500;
    }
  }
  
  var v = await Promise.all(promises);
  for (var i = 0; i < v.length; i++) {
    if (v[i]) {
      ctx.body = {
        token: jsonWebToken.sign({data: { roles: config.keys[i] }}, config.secret)
      };
      return;
    }
  }
  ctx.status = 401;
});

module.exports = app;
