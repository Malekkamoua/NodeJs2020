const mongoose = require("mongoose");

const Notification = mongoose.model(
    
    'Notification',
     new mongoose.Schema({ 

        url: {
            type: String,
            required: false,
            default: "none",
            min: 6,
            max: 1024,
        },
        title:{
            type: String,
            required: false,
            default: "none",
            min: 6,
            max: 1024,
        },
        user: [
            {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
            }
        ]

    }));

module.exports = Notification;
