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

const httpsOptions = {
  hostname: config.hostname,
  key: fs.readFileSync(config.ssl.key),
  cert: fs.readFileSync(config.ssl.cert)
};

const app = new Koa();

app.use(helmet());

if (process.env.NODE_ENV === "dev") app.use(logger());

app.use(koaBody());

app.use(mount("/conn", connRoute));

app.use(koaJwt({ secret: config.secret }));

app.use(mount("/get", getRoute));
app.use(mount("/set", setRoute));

// Run the server using https only
const port = process.env.PORT || 5120;
console.log("Running on port " + port);
// app.listen(port); // http (not recommended)
https.createServer(httpsOptions, app.callback()).listen(port); // https
