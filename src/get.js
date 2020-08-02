const Koa = require("koa");
const fs = require("fs");
const crypto = require("crypto");
const base64uri = require("url-safe-base64")

const pbkdf2 = require("./pbkdf2");

const config = require("../config.json");

const app = new Koa();

app.use(async (ctx) => {
	try {
		// Calculate the hash for the filename
		var filename_hash = await pbkdf2(ctx.request.body.title,
			config.filename_hash.salt,
			config.filename_hash.iterations,
			config.filename_hash.length,
			true);

		const filename =
			`${config.data}/${base64uri.encode(filename_hash)}.0`;

		// Calculate the hash for the AES256 key
		var data_hash = await pbkdf2(ctx.request.body.title,
			config.data_hash.salt,
			config.data_hash.iterations,
			32,
			false);

		if (!fs.existsSync(filename)) {
			ctx.body = "";
		} else {
			const enc = fs.readFileSync(filename);

			const iv = enc.slice(0, 16);
			
			const decipher = crypto.createDecipheriv("aes-256-cbc", data_hash, iv);
			const raw = Buffer.concat([decipher.update(enc.slice(16)), decipher.final()]);
			ctx.body = raw.toString("base64");
		}
			
		ctx.type = "application/base64"; 

		ctx.status = 200;
	} catch (e) {
		if (process.env.NODE_ENV === "dev")
			console.log(e);

		ctx.status = 500;

		ctx.body = {
			"name": "Internal Server Error",
			"code": 500,
			"message": "Internal server error."
		};
	}
});

module.exports = app;
