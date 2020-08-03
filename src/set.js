const Koa = require("koa");
const fs = require("fs");
const crypto = require("crypto");
const base64uri = require("url-safe-base64")

const pbkdf2 = require("./pbkdf2");

const config = require("../config.json");

const app = new Koa();

app.use(async (ctx) => {
	try {
		// Request validation
		if (ctx.state.user.expiration && ctx.state.user.expiration < Date.now() / 1000) {
			ctx.status = 401;

			ctx.body = {
				"name": "Unauthorized",
				"code": 401,
				"message": "Token expired."
			};

			return;
		}

		if (!ctx.state.user.roles.includes("set")) {
			ctx.status = 403;

			ctx.body = {
				"name": "Forbidden",
				"code": 403,
				"message": "Access deniend to role 'get'."
			};

			return;
		}

		if (!ctx.request.body.title) {
			ctx.status = 400;

			ctx.body = {
				"name": "Bad Request",
				"code": 400,
				"message": "Title was not specified in the query's body."
			};

			return;
		}

		// Calculate the hash for the filename and for the AES256 key
		var promises = [
			pbkdf2(ctx.request.body.title,
				config.filename_hash.salt,
				config.filename_hash.iterations,
				config.filename_hash.length,
				true),
			pbkdf2(ctx.request.body.title,
				config.data_hash.salt,
				config.data_hash.iterations,
				32,
				false)
		];

		var hashes = await Promise.all(promises);

		const filename = `${config.data}/${base64uri.encode(hashes[0])}.0`;
		
		if (ctx.request.body.body === "") {
			fs.unlink(filename, (err) => { if (process.env.NODE_ENV === "dev") console.log(err) });
		} else {
			const raw = Buffer.from(ctx.request.body.body, "base64");

			const iv = crypto.randomBytes(16);

			const cipher = crypto.createCipheriv("aes-256-cbc", hashes[1], iv);
			const enc = Buffer.concat([iv, cipher.update(raw), cipher.final()]);
			fs.writeFile(filename, enc, (err) => { if (process.env.NODE_ENV === "dev") console.log(err) });
		}

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
