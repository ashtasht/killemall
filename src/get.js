const fs = require("fs");
const Koa = require("koa");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const config = require("../config.json");

const app = new Koa();

app.use(async (ctx) => {
  try {
    if (ctx.state.user.expiration && ctx.state.user.expiration < Date.now() / 1000) {
      ctx.body = { "name": "Unauthorized", "code": 401, "message": "Token expired." };
      ctx.status = 401;
      return;
    }

    if (!ctx.state.user.roles.includes("get")) {
      ctx.body = { "name": "Forbidden", "code": 403, "message": "Access deniend to role 'get'." };
      ctx.status = 403;
      return;
    }

    if (!ctx.request.body.title) {
      ctx.body = { "name": "Bad Request", "code": 400, "message": "Title was not specified in the query's body." };
      ctx.status = 400;
      return;
    }

    // Calculate the hash
    let hash = await bcrypt.hash(ctx.request.body.title, config.salt);
    const filename = `${config.data}/${Buffer.from(hash).toString("base64")}.0`;

    if (!fs.existsSync(filename)) {
      ctx.body = "";
    } else {
      const enc = fs.readFileSync(filename);

      const iv = enc.slice(0, 16);
      const key = hash.substr(0, 32);
      
      const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
      const raw = Buffer.concat([decipher.update(enc.slice(16)), decipher.final()]);
      console.log(raw.toString('base64'))
      ctx.body = raw.toString('base64');
    }
      
    ctx.status = 200;
    ctx.type = "application/base64"; 
    return;
  } catch (e) {
    if (process.env.NODE_ENV === "dev") console.log(e);
    ctx.body = { "name": "Internal Server Error", "code": 500, "message": "Internal server error." };
    ctx.status = 500;
  }
});

module.exports = app;
