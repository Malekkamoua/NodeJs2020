const nodemailer = require('nodemailer');
const User = require('../models/User')
const Notification = require('../models/Notification')

async function sendNotification() {

  const notification_array = await Notification.find()

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'malekkamoua50@gmail.com',
      pass: '14112014Malek'
    }
  });

  notification_array.forEach(notif => {

    let htmlText = `Check this link : <a href=\"${notif.url}\">Link</a>`;
    let textToSend = `${notif.title} might interest you. `;
    const user =  model.find({_id: notif.user})

    try {
      let info = await transporter.sendMail({
        from: 'malekkamoua50@gmail.com',
        to: user.email,
        subject: jobTitle,
        text: textToSend,
        html: htmlText
      });

      console.log("Message sent: %s", info.messageId);

    } catch (error) {
      console.log(error);
    }
  });

}

module.exports = sendNotification;