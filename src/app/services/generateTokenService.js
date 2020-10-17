const jwt = require('jsonwebtoken');
const {TOKEN_SECRET} = require('../../config/env');

module.exports = (params = {})=>{
	return jwt.sign(params, TOKEN_SECRET,{expiresIn:"7d"});
}