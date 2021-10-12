const nodemailer = require('nodemailer');

const Email = require('email-templates');

module.exports=async (userEmail,template,data)=>{
    const transport = nodemailer.createTransport({ 
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USER, 
        pass: process.env.MAIL_PASSWORD
      }
    });
      
      const email = new Email({
        views: {root: './emails', options: { extension: 'ejs'}},
        message: {
          from: process.env.APP_MAIL
        },
        send: true,
        preview: false,
        transport
      });
      
      try{
        await email.send({
          template: template,
          message: {
            to: userEmail
          },
          locals: data
        })
      }      
      catch(error){
        console.error("Error occured in sending mail")
      }
}