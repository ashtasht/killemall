var crypto = require("crypto");

const pbkdf2 = (password, salt, iterations, keylen, base64) => {
	return new Promise((resolve, reject) => {

			var p = crypto.pbkdf2(password, salt, iterations,
				keylen, "sha512", (err, buff) => {
					if (err)
						return reject(err);
					
					if (base64)
						resolve(buff.toString("base64"));
					else
						resolve(buff)
				});
	});
}

module.exports = pbkdf2;
