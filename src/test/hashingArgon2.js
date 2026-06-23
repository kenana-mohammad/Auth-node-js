const argon2 = require('argon2');
argon2.hash("1111", {
        type: argon2.argon2id,
        memoryCost: 2 ** 16, // 64MB
        timeCost: 3,
        parallelism: 1,
        hashLength: 32
    }).then((e) => {

        console.log("hashed", e)
    })
    .catch((error) => {
        console.error("Error hashing password:", error);
    });
//compare argon2.v
argon2.verify("$argon2id$v=19$m=65536,t=3,p=1$3d0xJSVct3k/i4OGsCru7Q$o43+ToPWZi5lWv+jKQeesYTC8iPQeHS/JBSh5H9E6xY", "1111j")
    .then((e) => {
        console.log("verify", e)
    }).catch((error) => {
        console.log('error', error.message)
    })