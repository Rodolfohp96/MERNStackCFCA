const bcrypt = require('bcrypt');
const Student = require('../models/studentSchema.js');
const Subject = require('../models/subjectSchema.js');
const Sclass = require('../models/sclassSchema.js');

const calculateLateFee = (daysLate) => {
    if (daysLate <= 10) return 100;
    if (daysLate <= 20) return 150;
    if (daysLate <= 30) return 250;
    if (daysLate <= 60) return 350;
    if (daysLate <= 90) return 450;
    if (daysLate <= 120) return 550;
    if (daysLate <= 150) return 650;
    return 750; // o cualquier otro valor para más de 150 días
};

const updateLateFees = async (studentId) => {
    try {
        const student = await Student.findById(studentId);
        if (!student) {
            throw new Error('Estudiante no encontrado');
        }

        student.tuitions.forEach(tuition => {
            if (!tuition.paid && new Date() > tuition.dueDate) {
                const diffTime = Math.abs(new Date() - tuition.dueDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                tuition.lateFee = calculateLateFee(diffDays);
            }
        });

        await student.save();
    } catch (error) {
        console.error(error);
    }
};

const studentRegister = async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.password, salt);

        const existingStudent = await Student.findOne({
            rollNum: req.body.rollNum,
            school: req.body.adminID,
            sclassName: req.body.sclassName,
        });

        if (existingStudent) {
            return res.status(400).json({ message: 'Matrícula existente' });
        } else {
            const sclass = await Sclass.findById(req.body.sclassName);
            const tuitionAmount = sclass.grado === 'Preescolar' ? 2950 : 3000;
            const startYear = parseInt(req.body.cicloEscolar.split('-')[0]);
            const tuitionMonths = [
                { month: 'Septiembre', begDate: new Date(`${startYear}-08-26`), dueDate: new Date(`${startYear}-09-04`) },
                { month: 'Octubre', begDate: new Date(`${startYear}-10-01`), dueDate: new Date(`${startYear}-10-10`) },
                { month: 'Noviembre', begDate: new Date(`${startYear}-11-01`), dueDate: new Date(`${startYear}-11-10`) },
                { month: 'Diciembre y Agosto', begDate: new Date(`${startYear}-12-01`), dueDate: new Date(`${startYear}-12-10`) },
                { month: 'Enero', begDate: new Date(`${startYear + 1}-01-01`), dueDate: new Date(`${startYear + 1}-01-10`) },
                { month: 'Febrero', begDate: new Date(`${startYear + 1}-02-01`), dueDate: new Date(`${startYear + 1}-02-10`) },
                { month: 'Marzo', begDate: new Date(`${startYear + 1}-03-01`), dueDate: new Date(`${startYear + 1}-03-10`) },
                { month: 'Abril', begDate: new Date(`${startYear + 1}-04-01`), dueDate: new Date(`${startYear + 1}-04-10`) },
                { month: 'Mayo y Julio', begDate: new Date(`${startYear + 1}-05-01`), dueDate: new Date(`${startYear + 1}-05-10`) },
                { month: 'Junio', begDate: new Date(`${startYear + 1}-06-01`), dueDate: new Date(`${startYear + 1}-06-10`) }
            ];

            const tuitions = tuitionMonths.map(({ month, begDate, dueDate }) => ({
                tuitionMonth: month,
                amountDue: tuitionAmount,
                begDate: begDate,
                dueDate: dueDate
            }));

            const student = new Student({
                ...req.body,
                school: req.body.adminID,
                password: hashedPass,
                tuitions
            });

            let result = await student.save();
            result.password = undefined;
            res.status(201).json(result);
        }
    } catch (err) {
        res.status(500).json({ message: 'Error al registrar al estudiante', error: err.message });
    }
};

const studentLogIn = async (req, res) => {
    try {
        let student = await Student.findOne({ rollNum: req.body.rollNum, name: req.body.studentName });
        if (student) {
            const validated = await bcrypt.compare(req.body.password, student.password);
            if (validated) {
                student = await student.populate("school", "schoolName")
                student = await student.populate("sclassName", "sclassName")
                student.password = undefined;
                student.examResult = undefined;
                student.attendance = undefined;
                res.send(student);
            } else {
                res.send({ message: "Invalid password" });
            }
        } else {
            res.send({ message: "Student not found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getStudents = async (req, res) => {
    try {
        let students = await Student.find({ school: req.params.id }).populate("sclassName", "sclassName");
        if (students.length > 0) {
            let modifiedStudents = students.map((student) => {
                return { ...student._doc, password: undefined };
            });
            res.send(modifiedStudents);
        } else {
            res.send({ message: "No se encontraron estudiantes" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getStudentDetail = async (req, res) => {
    try {
        let student = await Student.findById(req.params.id)
            .populate("school", "schoolName")
            .populate("sclassName", "sclassName")
            .populate("examResult.subName", "subName")
            .populate("attendance.subName", "subName sessions");
        if (student) {
            student.password = undefined;
            res.send(student);
        }
        else {
            res.send({ message: "No se encontró al estudiante" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

const deleteStudent = async (req, res) => {
    try {
        const result = await Student.findByIdAndDelete(req.params.id)
        res.send(result)
    } catch (error) {
        res.status(500).json(err);
    }
}

const deleteStudents = async (req, res) => {
    try {
        const result = await Student.deleteMany({ school: req.params.id })
        if (result.deletedCount === 0) {
            res.send({ message: "No se encontraron estudiantes para eliminar" })
        } else {
            res.send(result)
        }
    } catch (error) {
        res.status(500).json(err);
    }
}

const deleteStudentsByClass = async (req, res) => {
    try {
        const result = await Student.deleteMany({ sclassName: req.params.id })
        if (result.deletedCount === 0) {
            res.send({ message: "No se encontraron estudiantes para eliminar" })
        } else {
            res.send(result)
        }
    } catch (error) {
        res.status(500).json(err);
    }
}

const updateStudent = async (req, res) => {
    try {
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10)
            res.body.password = await bcrypt.hash(res.body.password, salt)
        }
        let result = await Student.findByIdAndUpdate(req.params.id,
            { $set: req.body },
            { new: true })

        result.password = undefined;
        res.send(result)
    } catch (error) {
        res.status(500).json(error);
    }
}

const updateExamResult = async (req, res) => {
    const { subName, marksObtained } = req.body;

    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.send({ message: 'Estudiante no encontrado' });
        }

        const existingResult = student.examResult.find(
            (result) => result.subName.toString() === subName
        );

        if (existingResult) {
            existingResult.marksObtained = marksObtained;
        } else {
            student.examResult.push({ subName, marksObtained });
        }

        const result = await student.save();
        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const studentAttendance = async (req, res) => {
    const { subName, status, date } = req.body;

    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.send({ message: 'Estudiante no encontrado' });
        }

        const subject = await Subject.findById(subName);

        const existingAttendance = student.attendance.find(
            (a) =>
                a.date.toDateString() === new Date(date).toDateString() &&
                a.subName.toString() === subName
        );

        if (existingAttendance) {
            existingAttendance.status = status;
        } else {
            // Verificar si el estudiante ya asistió al número máximo de sesiones
            const attendedSessions = student.attendance.filter(
                (a) => a.subName.toString() === subName
            ).length;

            if (attendedSessions >= subject.sessions) {
                return res.send({ message: 'Límite máximo de asistencia alcanzado' });
            }

            student.attendance.push({ date, status, subName });
        }

        const result = await student.save();
        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const clearAllStudentsAttendanceBySubject = async (req, res) => {
    const subName = req.params.id;

    try {
        const result = await Student.updateMany(
            { 'attendance.subName': subName },
            { $pull: { attendance: { subName } } }
        );
        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const clearAllStudentsAttendance = async (req, res) => {
    const schoolId = req.params.id

    try {
        const result = await Student.updateMany(
            { school: schoolId },
            { $set: { attendance: [] } }
        );

        return res.send(result);
    } catch (error) {
        res.status500().json(error);
    }
};

const removeStudentAttendanceBySubject = async (req, res) => {
    const studentId = req.params.id;
    const subName = req.body.subId

    try {
        const result = await Student.updateOne(
            { _id: studentId },
            { $pull: { attendance: { subName: subName } } }
        );

        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const removeStudentAttendance = async (req, res) => {
    const studentId = req.params.id;

    try {
        const result = await Student.updateOne(
            { _id: studentId },
            { $set: { attendance: [] } }
        );

        return res.send(result);
    } catch (error) {
        res.status500().json(error);
    }
};

// Actualizar responsable de pago de un estudiante
const updatePaymentResponsible = async (req, res) => {
    try {
        const { studentId, paymentResponsible } = req.body;
        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).send({ message: 'Estudiante no encontrado' });
        }

        student.paymentResponsible = paymentResponsible;
        await student.save();
        res.send(student);
    } catch (error) {
        res.status(500).json(error);
    }
};

const bulkRegisterStudents = async (req, res) => {
    try {
        const students = JSON.parse(req.files.students.data.toString('utf8'));

        if (!Array.isArray(students)) {
            return res.status(400).json({ message: "El archivo JSON no contiene un array de estudiantes." });
        }

        const registeredStudents = [];

        for (const studentData of students) {
            const {
                name, rollNum, password, sclassName, adminID, role,
                scholarship, paymentResponsible_name, paymentResponsible_billing,
                paymentResponsible_email, paymentResponsible_relationship,
                paymentResponsible_phone, grado, cicloEscolar
            } = studentData;

            // Validate required fields
            if (!name || !rollNum || !password || !sclassName || !adminID || !role) {
                return res.status(400).json({ message: "Faltan campos obligatorios en el JSON" });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPass = await bcrypt.hash(password, salt);

            const sclass = await Sclass.findById(sclassName);
            if (!sclass) {
                return res.status(400).json({ message: `Clase no encontrada para ID: ${sclassName}` });
            }

            const tuitionAmount = sclass.grado === 'Preescolar' ? 2950 : 3000;
            const startYear = parseInt(cicloEscolar.split('-')[0]);

            const tuitionMonths = [
                { month: 'Septiembre', begDate: new Date(`${startYear}-08-26`), dueDate: new Date(`${startYear}-09-04`) },
                { month: 'Octubre', begDate: new Date(`${startYear}-10-01`), dueDate: new Date(`${startYear}-10-10`) },
                { month: 'Noviembre', begDate: new Date(`${startYear}-11-01`), dueDate: new Date(`${startYear}-11-10`) },
                { month: 'Diciembre y Agosto', begDate: new Date(`${startYear}-12-01`), dueDate: new Date(`${startYear}-12-10`) },
                { month: 'Enero', begDate: new Date(`${startYear + 1}-01-01`), dueDate: new Date(`${startYear + 1}-01-10`) },
                { month: 'Febrero', begDate: new Date(`${startYear + 1}-02-01`), dueDate: new Date(`${startYear + 1}-02-10`) },
                { month: 'Marzo', begDate: new Date(`${startYear + 1}-03-01`), dueDate: new Date(`${startYear + 1}-03-10`) },
                { month: 'Abril', begDate: new Date(`${startYear + 1}-04-01`), dueDate: new Date(`${startYear + 1}-04-10`) },
                { month: 'Mayo y Julio', begDate: new Date(`${startYear + 1}-05-01`), dueDate: new Date(`${startYear + 1}-05-10`) },
                { month: 'Junio', begDate: new Date(`${startYear + 1}-06-01`), dueDate: new Date(`${startYear + 1}-06-10`) }
            ];

            const tuitions = tuitionMonths.map(({ month, begDate, dueDate }) => ({
                tuitionMonth: month,
                amountDue: tuitionAmount,
                begDate,
                dueDate
            }));

            const newStudent = new Student({
                name,
                rollNum,
                password: hashedPass,
                sclassName,
                adminID,
                role,
                scholarship,
                paymentResponsible: {
                    name: paymentResponsible_name,
                    billing: paymentResponsible_billing,
                    email: paymentResponsible_email,
                    relationship: paymentResponsible_relationship,
                    phone: paymentResponsible_phone,
                },
                grado,
                cicloEscolar,
                tuitions
            });

            await newStudent.save();
            registeredStudents.push(newStudent);
        }

        res.status(201).json({ message: "Estudiantes registrados con éxito", data: registeredStudents });
    } catch (error) {
        console.error("Error al registrar estudiantes masivamente:", error); // Agregar logs de error
        res.status(500).json({ message: "Error al registrar estudiantes masivamente", error: error.message });
    }
};

module.exports = {
    studentRegister,
    studentLogIn,
    getStudents,
    getStudentDetail,
    deleteStudents,
    deleteStudent,
    updateStudent,
    studentAttendance,
    deleteStudentsByClass,
    updateExamResult,
    clearAllStudentsAttendanceBySubject,
    clearAllStudentsAttendance,
    removeStudentAttendanceBySubject,
    removeStudentAttendance,
    updatePaymentResponsible,
    bulkRegisterStudents
};
