const nodemailer = require('nodemailer')

module.exports = {
	transport : nodemailer.createTransport({
	    host:'smtp.mailtrap.io',
	    port:  2525,
	    auth: {
	        user: "a7517f24fdde39",
	        pass: "999305890853c2"
	    }
	}),
	
}




