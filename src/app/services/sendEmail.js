const nodemailer = require('nodemailer')
const handlebars = require('handlebars')
const fs = require('fs')
const path = require('path')
const {NODE_MAILER} = require('../../config/env');


module.exports = async (action,key,email)=>{
    const content = fs.readFileSync(path.resolve(__dirname,'..','..','tamplates','mail',`${action}.html`))
    const tamplate =  handlebars.compile(content.toString()) 
    const html =  tamplate({key})

    const mailOptions = {
        from: NODE_MAILER.SENDER_EMAIL, //email remetente (do sistema)
        to: email, //email do destinatário
        subject: action === 'confirm_registration'?'Confirmação de cadastro':action==='forgot_password'?'Recuperação de senha':'', //Assunto: 'Confirmação de cadastro' ou 'Recuperação de senha'
        html: html // tamplate de email: 'confirm_registration.html' ou 'forgot_password.html'
    }

    const transport = nodemailer.createTransport({
        service: 'gmail',
        port: 465,
	secure: true,
	auth: {
			user: "projetosect@gmail.com",
			pass: "xxxxxxxx"
		}
	})
    const info = await transport.sendMail(mailOptions)
    return info
}
