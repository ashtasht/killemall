# killemall
A simple server for accessing and writing encrypted data only if the title is known. It contains only 211 lines of code!

## How it works
Killemall works by encrypting (AES256) the body of each new entry with a hash (PBKDF2) of the original entry title as the key. But the original title isn't stored (only its hash, with a differnt salt). It means that an entry can be accessed only if the title is already known, yet the titles themselves are inaccessible (they are hashed).

## Setup
First, clone this repository, rename `config.example.json` to `config.json`.

### Setting the salts
Open the config.json file with your favourite text editor.

The `"salt"` property under `"filename_hash"` and `"data_hash"` will be the salt used for the entry's filenames and encryption keys accordingly. The `"salt"` property under `"key_hash"` will be the salt used to store the access keys. Set them all to diffrent, randomly generated string (like a long password). It is very important to use different salts in "filename_hash" and "data_hash", otherwise there is no point in using killemall.

### Defining the access keys

You will need to manually hash the access keys, to do so, open a command prompt and cd into `killemall/src`. Enter `node` and follow these steps:
1. `var pbkdf2 = require("./pbkdf2");`
2. For each hash you would like to calculate, execute the following:
```javascript
a = pbkdf2("the_key_i_want", "<salt>", <iterations>, <length>, true);
// Wait a few seconds...
a
```
Replace `<salt>`, `<iterations>` and `<length>` with the values set in `config.json`.

#### Roles and key Expiration
You should set the roles you want to be allowed for each key. You can also set an expiration time for each key in seconds in the `"expiration"` field.

### Setting the data location
Just set `"data"` to the path of a new directory in which the data will be stored.

### Other configuration options
You must specify a random string under `"secret"`.

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
You can encode strings to base64 in bash using `echo Kill the mall | base64 -w0`.

### Getting an entry
```bash
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <my_token>" http://localhost:5120/get --data '{"title":"<entry_title>"}'
```
You can decode the base64 decoded data using `echo VGhlIEZvdXIgSG9yc2VtYW4K | base64 -d` (replace `VGh...` with the base64 content recieved).

## A few more things
- This project is a hobby, so it might have security leaks which I am unaware of.
- Killemall uses port 5120 by defualt, you can change it by setting the `PORT` enviroment variable.
- Yes, "Killemall" and 5120 is a reference to Metallica.
