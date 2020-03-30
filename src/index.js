const fs = require("fs");
const https = require("https");

const Koa = require("koa");
if (process.env.NODE_ENV === "dev") var logger = require("koa-logger");
const mount = require("koa-mount");
const helmet = require("koa-helmet");
const koaJwt = require("koa-jwt");
const koaBody = require("koa-body");

const getRoute = require("./get.js");
const setRoute = require("./set.js");
const connRoute = require("./connect.js");

const config = require("../config.json");

const app = new Koa();

app.use(helmet());

if (process.env.NODE_ENV === "dev") pp.use(logger());

app.use(koaBody());

app.use(mount("/conn", connRoute));

app.use(koaJwt({ secret: config.secret }));

app.use(mount("/get", getRoute));
app.use(mount("/set", setRoute));

// Run the server
const port = process.env.PORT || 5120;
app.listen(port);
//https.createServer(app.callback()).listen(port);
console.log(`Running on port ${port}`);
