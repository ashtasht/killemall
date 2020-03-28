const fs = require("fs");
const https = require("https");

const Koa = require("koa");
const logger = require("koa-logger");
const mount = require("koa-mount");
const helmet = require("koa-helmet");
const koaJwt = require("koa-jwt");
const koaBody = require("koa-body");

const getRoute = require("./get.js");
const setRoute = require("./set.js");
const connRoute = require("./connect.js");
const jwt = require("./jwt.js");

const config = require("../config.json");

const app = new Koa();

app.use(helmet());

app.use(logger());

app.use(koaBody());

app.use(mount("/conn", connRoute));

app.use(jwt);

app.use(mount("/get", getRoute));
app.use(mount("/set", setRoute));

// Run the server
const port = process.env.PORT || 5120;
app.listen(port);
//https.createServer(app.callback()).listen(port);
console.log(`Running on port ${port}`);
