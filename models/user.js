const mongoose = require("mongoose");

const User = mongoose.model(
    
    'User',
     new mongoose.Schema({ 
        name: {
            type: String,
            required: true,
            min: 6,
            max: 255,
        },
        email: {
            type: String,
            required: true,
            min: 6,
            max: 255,
        },
        password: {
            type: String,
            required: true,
            min: 6,
            max: 1024,
        },
        motivation_letter: {
            type: String,
            required: true,
            min: 6,
            max: 1024,
        },
        cv: {
            type: String,
            required: true,
            min: 6,
            max: 1024,
        },
        date: {
            type: Date,
            default: Date.now,
        },
        jobOffers: [
            {
            type: mongoose.Schema.Types.ObjectId,
            ref: "JobOffer"
            }
        ]

    }));

module.exports = User;
