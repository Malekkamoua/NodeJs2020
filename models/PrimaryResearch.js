const mongoose = require("mongoose");

const PrimaryResearch = mongoose.model(
    'PrimaryResearch',
    new mongoose.Schema({

        links: [{
            type: String,
            required: true,
            min: 6,
            max: 1024,
        }],
        keywords: [{
            type: String,
            required: true,
            min: 6,
            max: 1024,
        }],
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        date: {
            type: Date,
            default: Date.now,
        },

    }));

module.exports = PrimaryResearch;