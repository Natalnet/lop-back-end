const nodemailer = require('nodemailer')

module.exports = {
	transport : nodemailer.createTransport({
	    host:'smtp.mailtrap.io',
	    port:  2525,
	    auth: {
	        user: "01249380c30569",
	        pass: "d3dd78f0530c19"
	    }
	}),
    mailOptions : {
        from: 'projetosect@gmail.com', //email remetente
        to: undefined, //email do destinatário
        subject: undefined, //Assunto: 'Confirmação de cadastro' ou 'Recuperação de senha'
        html: undefined // tamplate de email: 'confirm_registration.html' ou 'forgot_password.html'
    }
	
}

/*para acessar mailtrap:

login : plataforma_lop_lip@outlook.com
senha : plat_LOP2

conta criada para que todos testem os serviços de 
confirmação de cadastro e recuperação de senha 
com as mesmas credenciais 
*/





