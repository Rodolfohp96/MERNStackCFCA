const mongoose = require('mongoose');
const Tuition = require('../models/tuitionSchema.js');
const Receipt = require('../models/receiptSchema.js');
const Student = require('../models/studentSchema.js');
// Función para agregar tuitions
const addTuitions = async (req, res) => {
    try {
        const { studentId, tuitionMonth, amountDue, begDate, dueDate } = req.body;
        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).send({ message: 'Alumno no encontrado' });
        }

        const tuition = new Tuition({
            student: studentId,
            tuitionMonth,
            amountDue,
            begDate,
            dueDate
        });

        await tuition.save();
        student.tuitions.push(tuition);
        await student.save();

        res.send(tuition);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Función para pagar tuitions
const payTuition = async (req, res) => {
    try {
        const { tuitionId, paymentDate, amountPaid, paymentMethod, numHoja, studentId, studentName } = req.body;

        const tuition = await Tuition.findById(tuitionId);

        if (!tuition) {
            return res.status(404).json({ message: 'Tuitions no encontrado' });
        }

        // Actualiza la tuición como pagada y crea un nuevo recibo
        tuition.isPaid = true;
        tuition.paymentDate = paymentDate;
        tuition.amountPaid = amountPaid;
        tuition.paymentMethod = paymentMethod;
        if (paymentMethod === 'Transferencia' && numHoja) {
            tuition.numHoja = numHoja;
        }

        await tuition.save();

        const newReceipt = new Receipt({
            studentId,
            studentName,
            tuitionMonth: tuition.tuitionMonth,
            amountPaid,
            interest: tuition.interest,
            paymentDate,
            paymentMethod,
            numHoja: paymentMethod === 'Transferencia' ? numHoja : undefined
        });

        await newReceipt.save();

        res.status(201).json({ message: 'Pago procesado correctamente' });
    } catch (error) {
        console.error("Error al procesar el pago:", error);
        res.status(500).json({ message: 'Error al procesar el pago', error: error.message });
    }
};



const getTuitionsByStudent = async (req, res) => {
    try {
        const tuitions = await Tuition.find({ student: req.params.studentId });
        res.status(200).json(tuitions);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las colegiaturas', error });
    }
};
const editTuition = async (req, res) => {
    try {
        const { tuitionId } = req.params;
        const { tuitionMonth, amountDue, begDate, dueDate, isPaid } = req.body;

        const tuition = await Tuition.findById(tuitionId);

        if (!tuition) {
            return res.status(404).json({ message: 'Colegiatura no encontrada' });
        }

        tuition.tuitionMonth = tuitionMonth || tuition.tuitionMonth;
        tuition.amountDue = amountDue || tuition.amountDue;
        tuition.begDate = begDate || tuition.begDate;
        tuition.dueDate = dueDate || tuition.dueDate;
        tuition.isPaid = isPaid !== undefined ? isPaid : tuition.isPaid;

        await tuition.save();

        res.status(200).json({ message: 'Colegiatura actualizada con éxito', tuition });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la colegiatura', error });
    }
};
const updateAllTuitions = async (req, res) => {
    try {
        const { tuitions } = req.body; // Obtener la lista de colegiaturas del payload

        // Iterar sobre cada colegiatura y actualizarla
        const updatePromises = tuitions.map(tuition => 
            Tuition.findByIdAndUpdate(
                tuition._id, 
                { $set: { isPaid: true } }, // Establecer isPaid en true
                { new: true } // Devolver el documento actualizado
            )
        );

        const updatedTuitions = await Promise.all(updatePromises);

        // Verificar si alguna colegiatura fue actualizada
        if (updatedTuitions.length > 0) {
            res.status(200).json({ message: "Tuitions updated successfully", updatedTuitions });
        } else {
            res.status(404).json({ message: "No tuitions were updated" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error updating tuitions", error });
    }
};

const addTuition = async (req, res) => {
    try {
        const newTuition = new Tuition(req.body);
        await newTuition.save();
        res.status(201).json(newTuition);
    } catch (error) {
        res.status(500).json({ message: "Error adding tuition", error });
    }
};
const processPayment = async (req, res) => {
    try {
        const { studentId, tuitionId, tuitionMonth, grado, grupo, paymentDate, amountPaid, paymentMethod, numHoja } = req.body;
        if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(tuitionId)) {
            return res.status(400).json({ message: "ID inválido" });
        }

        // Buscar el estudiante por su ID
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Estudiante no encontrado" });
        }

        // Completar el nombre del estudiante
        const studentName = student.name;

        // Crear el recibo con el nombre del estudiante
        const newReceipt = new Receipt({
            studentId: studentId, // Asegúrate de que este campo esté bien
            studentName: studentName,
            tuition: tuitionId,
            tuitionMonth: tuitionMonth,
            grado: grado,
            grupo: grupo,
            paymentDate: paymentDate,
            amountPaid: amountPaid,
            paymentMethod: paymentMethod,
            numHoja: paymentMethod === 'Transferencia' ? numHoja : undefined,
        });

        await newReceipt.save();

        // Actualizar el estado de la colegiatura si es necesario
        await Tuition.findByIdAndUpdate(tuitionId, { isPaid: true });

        res.status(201).json({ message: "Pago procesado con éxito", receipt: newReceipt });
    } catch (error) {
        res.status(500).json({ message: "Error al procesar el pago", error: error.message });
    }
};


module.exports = {
    addTuitions,
    payTuition,
    getTuitionsByStudent,
    editTuition,
    updateAllTuitions,
    addTuition,
    processPayment
};
