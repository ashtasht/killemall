# killemall
A simple server for accessing and writing encrypted data only if the title is known. It contains only 192 lines of code!

## How it works
Killemall works by encrypting (AES256) the body of each entry with one hash (Argon2) of the original title and storing the entry name as an another hash. It means that an entry can be accessed only if the title is already known, the titles themselves cannot be listed (they are hashed).

## Setup
First, clone this repository. Rename `config.json.example` to `config.json`.

### Generating the keys
Open the config.json file with your favourite editor.

The `"salt"` property under "filename_hash" and "data_hash" will be the salt used to store titles. It should be a randomly generated string (like a password, but you don't need to remember it). It is very important to use a different salt in "filename_hash" and "data_hash", otherwise there is no point in using killemall.

Each hash under `keys` can be generated using:
```javascript
var argon2 = require("argon2");
a = argon2.hash("the_key_i_want");
// Wait a little...
a
```

#### Roles and key Expiration
You should set the roles you want to be allowed for each key. You can also set an expiration time for each key in seconds in the `"expiration"` field.

### Setting the data location
Just set `"data"` to the path of a new directory in which the data will be stored.

### Other configuration options
You just need to specify a random string under `"secret"`.

You need to specify a hostname under `"hostname"`.

If you want to use SSL (and you really should), set `ssl.ssl` to true and, the paths of your key and certificate under `ssl.key` and `ssl.cert` and set the hostname.

Now you can run the server using `pm2 start`, `npm start` or `node src/index.js`.
## Usage with cURL
### Getting a token
Killemall uses JWT, so in order to get a token with cURL you need to run the following command:
```bash
curl -X POST -H "Content-Type: application/json" --data '{"key":"my_key"}' http://localhost:5120/conn
```
### Setting an entry
```bash
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <my_token>" http://localhost:5120/set --data  '{"title":"<entry_title>","body":"<base64_encoded_body>"}'
```
You can encode strings to base64 in bash using `echo Kill the mall | base64 -w0`

### Getting an entry
```bash
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <my_token>" http://localhost:5120/get --data '{"title":"<entry_title>"}'
(You can decode the base64 decoded data using `echo VGhlIEZvdXIgSG9yc2VtYW4K | base64 -d`
```
## A Few More Things
 - This project is a hobby, so it might have security leaks which I'm unaware of.
 - Killemall uses port 5120 by defualt, you can change it by setting the `PORT` enviroment variable.
 - Yes, "Killemall" and 5120 is a reference to Metallica.
