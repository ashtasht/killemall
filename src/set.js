const Koa = require("koa");
const fs = require("fs");
const crypto = require("crypto");
const argon2 = require("argon2");
const base64uri = require("url-safe-base64")

const config = require("../config.json");

const app = new Koa();

app.use(async (ctx) => {
	try {
		// Request validation
		if (ctx.state.user.expiration && ctx.state.user.expiration < Date.now() / 1000) {
			ctx.body = { "name": "Unauthorized", "code": 401, "message": "Token expired." };
			ctx.status = 401;
			return;
		}

		if (!ctx.state.user.roles.includes("set")) {
			ctx.body = { "name": "Forbidden", "code": 403, "message": "Access deniend to role 'get'." };
			ctx.status = 403;
			return;
		}

		if (!ctx.request.body.title) {
			ctx.body = { "name": "Bad Request", "code": 400, "message": "Title was not specified in the query's body." };
			ctx.status = 400;
			return;
		}

		// Calculate the hash for the filename
		let filename_hash = await argon2.hash(ctx.request.body.title, {
				hashLength: config.filename_hash.length,
				timeCost: config.filename_hash.time,
				memoryCost: config.filename_hash.memory,
				parallelism: 2,
				type: argon2.argon2id,
				raw: true,
				salt: Buffer.from(config.filename_hash.salt)
			});

		const filename = `${config.data}/${base64uri.encode(Buffer.from(filename_hash).toString("base64"))}.0`;
		
		// Calculate the hash for the AES256 key
		let data_hash = await argon2.hash(ctx.request.body.title, { raw: true, salt: config.data_hash.salt, 
				hashLength: 32,
				timeCost: config.data_hash.time,
				memoryCost: config.data_hash.memory,
				parallelism: 2,
				type: argon2.argon2id,
				raw: true,
				salt: Buffer.from(config.data_hash.salt)
			});

		if (ctx.request.body.body === "") {
			fs.unlink(filename, (err) => { if (process.env.NODE_ENV === "dev") console.log(err) });
		} else {
			const raw = Buffer.from(ctx.request.body.body, "base64");

			const iv = crypto.randomBytes(16);

			const cipher = crypto.createCipheriv('aes-256-cbc', data_hash, iv);
			const enc = Buffer.concat([iv, cipher.update(raw), cipher.final()]);
			fs.writeFile(filename, enc, (err) => { if (process.env.NODE_ENV === "dev") console.log(err) });
		}

		ctx.status = 200;
		return;
	} catch (e) {
		if (process.env.NODE_ENV === "dev") console.log(e);
		ctx.body = { "name": "Internal Server Error", "code": 500, "message": "Internal server error." };
		ctx.status = 500;
	}
});

module.exports = app;
