const Koa = require("koa");
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

      ctx.body = { "name": "Internal Server Error", "code": 500, "message": "Cannot compare the hash of some key." };
      ctx.status = 500;
    }
  }
  
  // Compare all the keys at once
  var v = await Promise.all(promises);

  // Find the key used
  for (i = 0; i < v.length; i++) {
    if (v[i]) {
      var data = new Object();
      data.roles = config.keys[i].roles;
      if (config.keys[i].expiration)
        data.expiration = Math.floor(Date.now() / 1000 + config.keys[i].expiration);
      ctx.body = {
        token: jsonWebToken.sign(data, config.secret)
      };
      return;
    }
  }

  // Invalid key
  ctx.body = { "name": "Unauthorized", "code": 401, "message": "Invalid key." };
  ctx.status = 401;
});

module.exports = app;
