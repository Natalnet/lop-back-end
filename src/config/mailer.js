const nodemailer = require('nodemailer')

var transport = nodemailer.createTransport({
    host:'smtp.mailtrap.io',
    port:  2525,
    auth: {
        user: "a7517f24fdde39",
        pass: "999305890853c2"
    }
}); 

module.exports = transport;
