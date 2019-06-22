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
    mailOptions : {
        from: 'projetosect@gmail.com',
        to: undefined,
        //template: 'auth/forgot_password',
        subject: 'Recuperação de senha',
        //context: {key},
        html: undefined
        //html: '<p>Clique no link a seguir para recurerar sua senha: http://localhost:3000/auth/reset_password?token=' + token+'</p>'
    }
	
}




