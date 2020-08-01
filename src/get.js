const Koa = require("koa");
const fs = require("fs");
const crypto = require("crypto");
const argon2 = require("argon2");
const base64uri = require("url-safe-base64")

const config = require("../config.json");

const app = new Koa();

app.use(async (ctx) => {
	try {
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

		if (!fs.existsSync(filename)) {
			ctx.body = "";
		} else {
			const enc = fs.readFileSync(filename);

			const iv = enc.slice(0, 16);
			
			const decipher = crypto.createDecipheriv("aes-256-cbc", data_hash, iv);
			const raw = Buffer.concat([decipher.update(enc.slice(16)), decipher.final()]);
			ctx.body = raw.toString('base64');
		}
			
		ctx.status = 200;
		ctx.type = "application/base64"; 
		return;
	} catch (e) {
		if (process.env.NODE_ENV === "dev") console.log(e);
		ctx.body = { "name": "Internal Server Error", "code": 500, "message": "Internal server error." };
		ctx.status = 500;
	}
});

module.exports = app;
