const nodemailer = require('nodemailer');

async function sendNotification(url,jobTitle) {

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'malekkamoua50@gmail.com',
        pass:'14112014Malek'
      }
    });
  
    let htmlText = `Check this link : <a href=\"${url}\">Link</a>`;
    let textToSend =  `${jobTitle} might interest you. `;
    try {
        let info = await transporter.sendMail({
            from: 'malekkamoua50@gmail.com',
            to: "malekkamoua50@gmail.com",
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