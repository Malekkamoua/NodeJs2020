const mongoose = require("mongoose");

const JobOffer = mongoose.model(
    'JobOffer',
    new mongoose.Schema({

        job_link: {
            type: String,
            required: true,
            min: 6,
            max: 1024,
        },
        entreprise_email: {
            type: String,
            required: true,
            min: 6,
            max: 255,
        },
        title: {
            type: String,
            required: true,
            min: 6,
            max: 1024,
        },
        image: {
            type: String,
            required: true,
            min: 6,
            max: 1024,
        },
        description: {
            type: String,
            required: true,
            min: 6,
            max: 1024,
        },
        salaire: {
            type: String,
            required: false,
            min: 6,
            max: 1024,
        },
        emplacement: {
            type: String,
            required: false,
            min: 6,
            max: 1024,
        },
        contract_type: {
            type: String,
            required: false,
            min: 6,
            max: 1024,
        },
        status: {
            type: String,
            required: true,
            default:"unchanged"
        },
        has_keywords: {
            type: Boolean,
            required: true
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        date: {
            type: Date,
            default: Date.now,
        },

    }));

module.exports = JobOffer;