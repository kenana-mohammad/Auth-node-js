const jwt = require('jsonwebtoken');
const secretKey = "111";
const token = jwt.sign({ name: "kinana", id: 1 }, secretKey, { expiresIn: '15m' });
console.log(token);
//decoded
const decoded = jwt.verify(token, secretKey);
console.log(decoded);
//{ name: 'kinana', id: 1, iat: 1780826123, exp: 1780827023 }