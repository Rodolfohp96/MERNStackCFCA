const Receipt = require('../models/receiptSchema');
const Student = require('../models/studentSchema');

// Obtener todos los recibos de un estudiante específico
const getReceiptsByStudent = async (req, res) => {
    try {
        const receipts = await Receipt.find({ studentId: req.params.studentId });
        if (!receipts || receipts.length === 0) {
            return res.status(404).json({ message: 'No se encontraron recibos para el estudiante especificado.' });
        }
        res.status(200).json(receipts);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los recibos del estudiante.', error: error.message });
    }
};

// Obtener un recibo específico por ID
const getReceiptById = async (req, res) => {
    try {
        const receipt = await Receipt.findById(req.params.receiptId);
        if (!receipt) {
            return res.status(404).json({ message: 'Recibo no encontrado.' });
        }
        res.status(200).json(receipt);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el recibo.', error: error.message });
    }
};

// Crear un nuevo recibo
const createReceipt = async (req, res) => {
    try {
        const { studentId, studentName, tuitionMonth, amountPaid, interest, paymentDate, grado, grupo, paymentMethod, numHoja } = req.body;

        if (!studentId || !studentName || !tuitionMonth || !amountPaid || !paymentDate || !paymentMethod) {
            return res.status(400).json({ message: 'Todos los campos obligatorios deben ser proporcionados.' });
        }

        const newReceipt = new Receipt({
            studentId,
            studentName,
            tuitionMonth,
            amountPaid,
            interest,
            paymentDate,
            grado,
            grupo,
            paymentMethod,
            numHoja: numHoja || undefined, // Solo se incluirá si es un número válido
        });

        const savedReceipt = await newReceipt.save();
        res.status(201).json(savedReceipt);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el recibo.', error: error.message });
    }
};

// Eliminar un recibo por ID
const deleteReceipt = async (req, res) => {
    try {
        const receipt = await Receipt.findByIdAndDelete(req.params.receiptId);
        if (!receipt) {
            return res.status(404).json({ message: 'Recibo no encontrado.' });
        }
        res.status(200).json({ message: 'Recibo eliminado correctamente.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el recibo.', error: error.message });
    }
};

// Obtener todos los recibos asociados a un admin (por ID del admin)
const getReceiptsByAdmin = async (req, res) => {
    try {
        // Obtiene todos los recibos sin filtrar por adminID
        const receipts = await Receipt.find();
        if (!receipts || receipts.length === 0) {
            return res.status(404).json({ message: 'No se encontraron recibos.' });
        }
        res.status(200).json(receipts);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los recibos.', error: error.message });
    }
};

module.exports = {
    getReceiptsByStudent,
    getReceiptById,
    createReceipt,
    deleteReceipt,
    getReceiptsByAdmin
};
