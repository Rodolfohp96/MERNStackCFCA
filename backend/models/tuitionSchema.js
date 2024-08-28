const mongoose = require('mongoose');

const tuitionSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        required: true,
    },
    tuitionMonth: {
        type: String,
        required: true,
    },
    amountDue: {
        type: Number,
        required: true,
    },
    begDate: {
        type: Date,
        required: true,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    isPaid: {
        type: Boolean,
        default: false,
    },
    numHoja: {
        type: Number, // Campo opcional para el número de hoja
        required: function() {
            return this.paymentMethod === 'Transferencia'; // Solo obligatorio si el método de pago es "Transferencia"
        }
    },
}, { timestamps: true });

module.exports = mongoose.model('tuition', tuitionSchema);
