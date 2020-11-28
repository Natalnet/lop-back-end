const jwt = require('jsonwebtoken');
const TOKEN_SECRET = process.env.TOKEN_SECRET;

module.exports = (params = {})=>{
	return jwt.sign(params, TOKEN_SECRET,{expiresIn:"7d"});
}
