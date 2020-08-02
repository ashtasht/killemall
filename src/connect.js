const Koa = require("koa");
const jsonWebToken = require("jsonwebtoken");

const pbkdf2 = require("./pbkdf2");

const config = require("../config.json");

const app = new Koa();

app.use(async (ctx) => {
	if (!ctx.request.body.key) {
		ctx.status = 400;
		return;
	}

	try {
		key_hash = await pbkdf2(ctx.request.body.key,
			config.key_hash.salt,
			config.key_hash.iterations,
			config.key_hash.length,
			true);
	
		// Find the key used
		for (i = 0; i < config.keys.length; i++) {
			if (key_hash == config.keys[i].hash) {
				var data = new Object();
				data.roles = config.keys[i].roles;
				if (config.keys[i].expiration)
					data.expiration = Math.floor(
						Date.now() / 1000 + config.keys[i].expiration
					);
				ctx.body = {
					token: jsonWebToken.sign(data, config.secret)
				};
				return;
			}
		}
	} catch {
		ctx.status = 500;
	
		ctx.body = {
			"name": "Internal Server Error",
			"code": 500,
			"message": "Cannot calculate the hash of a key."
		};
		
		return;
	}

	// Invalid key
	ctx.body = {
		"name": "Unauthorized",
		"code": 401,
		"message": "Invalid key."
	};
	ctx.status = 401;
});

module.exports = app;
