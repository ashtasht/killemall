const Koa = require("koa");
const bcrypt = require("bcrypt");
const aes256 = require("aes256");
const mysql = require("promise-mysql");

const config = require("../config.json");

const app = new Koa();

// Connect to the database
var connection;
mysql.createConnection(config.db).then((c) => { connection = c; });

app.use(async (ctx) => {
  try {
    if (!ctx.state.user.data.roles.roles.includes("get")) {
      ctx.status = 403;
      return
    }

    if (!ctx.request.body.title) {
        ctx.status = 400;
        return;
    }

    var hash = await bcrypt.hash(ctx.request.body.title, config.salt);
      
    const q = "SELECT body FROM entries WHERE title = ?";
    const results = await connection.query(q, hash);

    if (!results[0].body) {
      ctx.body = { body: "" };
    } else {
      ctx.body = { body: aes256.decrypt(ctx.request.body.title, results[0].body.toString()) };
    }

    ctx.status = 200;
    return;
  } catch (e) {
    ctx.status = 500;
  }
});

module.exports = app;
