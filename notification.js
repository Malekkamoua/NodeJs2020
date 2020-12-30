const nodemailer = require('nodemailer');

async function sendNotification(url,jobTitle) {

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'email@gmail.com',
        pass:'***********'
      }
    });
  
    let htmlText = `Check this link : <a href=\"${url}\">Link</a>`;
    let textToSend =  `${jobTitle} might interest you. `;
    try {
        let info = await transporter.sendMail({
            from: 'email@gmail.com',
            to: "email@gmail.com",
            subject: jobTitle, 
            text: textToSend,
            html: htmlText
          });
        
          console.log("Message sent: %s", info.messageId);

    } catch (error) {
        console.log(error);
    }
}

module.exports = sendNotification;