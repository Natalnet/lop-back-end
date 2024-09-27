const jwt = require('jsonwebtoken');
const TOKEN_SECRET = process.env.TOKEN_SECRET;

module.exports = (params = {})=>{
	const expiresIn100Years = 100 * 365 * 24 * 60 * 60;
	return jwt.sign(params, TOKEN_SECRET,{expiresIn:expiresIn100Years });
}
