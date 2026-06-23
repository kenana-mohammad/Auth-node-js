const bcrypt = require('bcryptjs');
//process hashing is promice 
abcrypt.hash("1111", 12)
    .then((e) => {
        console.log(e)
    })
    .catch((error) => {
        console.log('error', error)
    })
    //const hashed
const hashed = '$2b$12$ohhvqCz/BAoJGW2dWxhj/eeMKkE7EgYX.9ElmaV2xiJQ52.XGq08C';
bcrypt.compare('1111', hashed)
    .then((e) => {
        console.log(e)
    })
    .catch((error) => {
        console.log('error', error)
    })