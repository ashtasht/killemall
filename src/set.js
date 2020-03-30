const Koa = require("koa");
const bcrypt = require("bcrypt");
const aes256 = require("aes256");
const mysql = require("promise-mysql");

const config = require("../config.json");

const app = new Koa();

// Connect to the database
var connection;
mysql.createConnection(config.db).then((c) => { connection = c; return; }).catch((err) => console.log(`Error establishing connection to the database:\n${err}`));

app.use(async (ctx) => {
  try {
    if (ctx.state.user.expiration && ctx.state.user.expiration < Date.now() / 1000) {
      ctx.status = 401;
      return;
    }

    if (!ctx.state.user.roles.includes("set")) {
      ctx.status = 403;
      return;
    }

    if (!ctx.request.body.title || !ctx.request.body.body) {
      ctx.status = 400;
      return;
    }

    var hash = await bcrypt.hash(ctx.request.body.title, config.salt);
    const body = aes256.encrypt(ctx.request.body.title, ctx.request.body.body);

    const q = "INSERT INTO entries SET ? ON DUPLICATE KEY UPDATE body = ?;";
    await connection.query(q, [{ title: hash, body: body }, body]);

    ctx.status = 200;
    return;
  } catch (e) {
    ctx.status = 500;
  }
});

module.exports = app;
