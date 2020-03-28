const koaJwt = require("koa-jwt");

const config = require("../config.json");

module.exports = koaJwt({ secret: config.secret });
