const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    rollNum: {
        type: Number,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    sclassName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
        required: true,
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    examResult: [
        {
            subName: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'subject',
            },
            marksObtained: {
                type: Number,
            },
        }
    ],
    attendance: [
        {
            subName: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'subject',
            },
            date: {
                type: Date,
                default: Date.now,
            },
            status: {
                type: String,
                enum: ['Present', 'Absent'],
            },
        }
    ],
    paymentResponsible: {
        name: {
            type: String,
        },
        billing: {
            type: Boolean,
        },
        email: {
            type: String,
        },
        relationship: {
            type: String,
        },
        phone: {
            type: String,
        }
    },
    tuitions: [
        {
            tuitionMonth: {
                type: String,
                required: true,
            },
            amountDue: {
                type: Number,
                required: true,
            },
            begDate:{
                type: Date,
                required: true
            },
            dueDate: {
                type: Date,
                required: true,
            },
            isPaid: {
                type: Boolean,
                default: false,
            },
        }
    ],
}, { timestamps: true });

module.exports = mongoose.model('student', studentSchema);
