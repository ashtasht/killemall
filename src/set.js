const Koa = require("koa");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const fs = require("fs");

const config = require("../config.json");

const app = new Koa();

app.use(async (ctx) => {
  try {
    // Request validation
    if (ctx.state.user.expiration && ctx.state.user.expiration < Date.now() / 1000) {
      ctx.body = { "name": "Unauthorized", "code": 401, "message": "Token expired." };
      ctx.status = 401;
      return;
    }

    if (!ctx.state.user.roles.includes("set")) {
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

    if (ctx.request.body.body === "") {
      fs.unlink(filename, (err) => { if (process.env.NODE_ENV === "dev") console.log(err) });

    } else {
      const raw = Buffer.from(ctx.request.body.body, "base64");
      console.log(raw.toString('base64'))

      const iv = crypto.randomBytes(16);
      const key = hash.substr(0, 32);

      const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
      const enc = Buffer.concat([iv, cipher.update(raw), cipher.final()]);
      fs.writeFile(filename, enc, (err) => { if (process.env.NODE_ENV === "dev") console.log(err) });
    }

    ctx.status = 200;
    return;
  } catch (e) {
    if (process.env.NODE_ENV === "dev") console.log(e);
    ctx.body = { "name": "Internal Server Error", "code": 500, "message": "Internal server error." };
    ctx.status = 500;
  }
});

module.exports = app;
