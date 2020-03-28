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
    if (ctx.state.user.data.roles.roles.includes("get")) {
      if (!ctx.request.body.title) {
        ctx.status = 400;
        return;
      }
      
      await new Promise((resolve, reject) => {
        bcrypt.hash(ctx.request.body.title, config.salt, (err, hash) => {
          const q = "SELECT body FROM entries WHERE title = ?";
          connection.query(q, hash, (error, results, fields) => {
            if (error) {
              ctx.status = 500;
            } else {
              if (!results[0].body) {
                ctx.body = { body: "" };
              } else {
                ctx.body = { body: aes256.decrypt(ctx.request.body.title, results[0].body.toString()) };
              }

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
