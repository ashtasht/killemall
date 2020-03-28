const Koa = require("koa");
const bcrypt = require("bcrypt");
const aes256 = require("aes256");
const mysql = require("mysql");

const config = require("../config.json");

const app = new Koa();

// Connect to the database
var connection = mysql.createConnection(config.db);
connection.connect();

app.use(async (ctx) => {
  try {
    if (ctx.state.user.data.roles.roles.includes("set")) {
      if (!ctx.request.body.title || !ctx.request.body.body) {
        ctx.status = 400;
        return;
      }
      
      await new Promise((resolve, reject) => {
        bcrypt.hash(ctx.request.body.title, config.salt, (err, hash) => {
          const body = aes256.encrypt(ctx.request.body.title, ctx.request.body.body);

          const q = "INSERT INTO entries SET ? ON DUPLICATE KEY UPDATE body = ?;";
          connection.query(q, [{ title: hash, body: body }, body], (error, results, fields) => {
            if (error) {
              reject();
            } else {
              ctx.status = 200;
              resolve();
            }
          });
        });
      });
    } else {
      ctx.status = 403;
    }
  } catch (e) {
    ctx.status = 500;
  }
});

module.exports = app;
