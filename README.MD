### 1) Maildev

1. Install maildev globally using npm
```
npm install maildev@0.14.0 -g
```
2. Run maildev 
```
maildev --incoming-user user --incoming-pass pass -v
```

### 2) mongo

Connect to mongo and create new user
```
> mongo
...
> use ninja_db
switched to db ninja_db
> db.createUser( {user: "ninja", pwd: "ojokjfoqjfoiqjdpoqwjd2131jrdj12098dj1208dj120", roles:["dbOwner"]} )
Successfully added user: { "user" : "ninja", "roles" : [ "dbOwner" ] }
```
### 3) start server
To start server run:
```
npm run start 
```
### 4) run tests

```
npm run test
```
