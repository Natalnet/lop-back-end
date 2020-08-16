module.exports =
{
    //JWT
    TOKEN_SECRET: process.env.TOKEN_SECRET || "xxx",
    
    // Express Server Port
    PORT: process.env.PORT || 3001,
    
    //nodemailer credentials
    NODE_MAILER: {
	    host: process.env.HOST_MAILER || 'smtp.mailtrap.io',
	    port: process.env.PORT_MAILER ||  2525,
		user: process.env.USER_MAILER || "projetosect@gmail.com",
		pass: process.env.PASS_MAILER || "xxxx",
		sender_email : process.env.SENDER_EMAIL || 'projetosect@gmail.com' 
    },
    //databse credentials
    DATABASE:{
        host:process.env.HOST || '127.0.0.1',
        db: process.env.DB || 'xxxx',
        user:process.env.DB_USER || 'xxx',
        password:process.env.DB_PASSWORD || 'xxxx'
        //NODE_MAILER.SENDER_EMAIL
        //465
    }
}
