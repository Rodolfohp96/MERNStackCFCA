const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const receiptSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        required: true
    },
    studentName: {
        type: String,
        required: true
    },
    tuitionMonth: {
        type: String,
        required: true
    },
    amountPaid: {
        type: Number,
        required: true
    },
    interest: {
        type: Number,
        default: 0
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    grado:{
        type: String,
    },
    grupo:{
        type: String,
    },
    folio: { 
        type: Number 
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['Efectivo', 'Transferencia']  // Define los métodos de pago permitidos
    },
    numHoja: {
        type: String, // Campo opcional para el número de hoja
        required: function() {
            return this.paymentMethod === 'Transferencia'; // Solo obligatorio si el método de pago es "Transferencia"
        }
    }
}, { timestamps: true });

receiptSchema.plugin(AutoIncrement, { inc_field: 'folio' });

module.exports = mongoose.model("receipt", receiptSchema);
