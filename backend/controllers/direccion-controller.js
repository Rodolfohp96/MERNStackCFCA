const bcrypt = require('bcrypt');
const Direccion = require('../models/direccionSchema.js');
const Sclass = require('../models/sclassSchema.js');
const Student = require('../models/studentSchema.js');
const Teacher = require('../models/teacherSchema.js');
const Subject = require('../models/subjectSchema.js');
const Notice = require('../models/noticeSchema.js');
const Complain = require('../models/complainSchema.js');

// const direccionRegister = async (req, res) => {
//     try {
//         const salt = await bcrypt.genSalt(10);
//         const hashedPass = await bcrypt.hash(req.body.password, salt);

//         const direccion = new Direccion({
//             ...req.body,
//             password: hashedPass
//         });

//         const existingDireccionByEmail = await Direccion.findOne({ email: req.body.email });
//         const existingSchool = await Direccion.findOne({ schoolName: req.body.schoolName });

//         if (existingDireccionByEmail) {
//             res.send({ message: 'Email already exists' });
//         }
//         else if (existingSchool) {
//             res.send({ message: 'School name already exists' });
//         }
//         else {
//             let result = await Direccion.save();
//             result.password = undefined;
//             res.send(result);
//         }
//     } catch (err) {
//         res.status(500).json(err);
//     }
// };

// const direccionLogIn = async (req, res) => {
//     if (req.body.email && req.body.password) {
//         let direccion = await Direccion.findOne({ email: req.body.email });
//         if (direccion) {
//             const validated = await bcrypt.compare(req.body.password, direccion.password);
//             if (validated) {
//                 direccion.password = undefined;
//                 res.send(direccion);
//             } else {
//                 res.send({ message: "Invalid password" });
//             }
//         } else {
//             res.send({ message: "User not found" });
//         }
//     } else {
//         res.send({ message: "Email and password are required" });
//     }
// };

const direccionRegister = async (req, res) => {
    try {
        const direccion = new Direccion({
            ...req.body
        });

        const existingDireccionByEmail = await Direccion.findOne({ email: req.body.email });

        if (existingDireccionByEmail) {
            res.send({ message: 'Email already exists' });
        }
        else {
            let result = await direccion.save();
            result.password = undefined;
            res.send(result);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const direccionLogIn = async (req, res) => {
    if (req.body.email && req.body.password) {
        let direccion = await Direccion.findOne({ email: req.body.email });
        if (direccion) {
            if (req.body.password === direccion.password) {
                direccion.password = undefined;
                res.send(direccion);
            } else {
                res.send({ message: "Invalid password" });
            }
        } else {
            res.send({ message: "User not found" });
        }
    } else {
        res.send({ message: "Email and password are required" });
    }
};

const getDireccionDetail = async (req, res) => {
    try {
        let direccion = await Direccion.findById(req.params.id);
        if (direccion) {
            direccion.password = undefined;
            res.send(direccion);
        }
        else {
            res.send({ message: "No direccion found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

// const deleteDireccion = async (req, res) => {
//     try {
//         const result = await Direccion.findByIdAndDelete(req.params.id)

//         await Sclass.deleteMany({ school: req.params.id });
//         await Student.deleteMany({ school: req.params.id });
//         await Teacher.deleteMany({ school: req.params.id });
//         await Subject.deleteMany({ school: req.params.id });
//         await Notice.deleteMany({ school: req.params.id });
//         await Complain.deleteMany({ school: req.params.id });

//         res.send(result)
//     } catch (error) {
//         res.status(500).json(err);
//     }
// }

// const updateDireccion = async (req, res) => {
//     try {
//         if (req.body.password) {
//             const salt = await bcrypt.genSalt(10)
//             res.body.password = await bcrypt.hash(res.body.password, salt)
//         }
//         let result = await Direccion.findByIdAndUpdate(req.params.id,
//             { $set: req.body },
//             { new: true })

//         result.password = undefined;
//         res.send(result)
//     } catch (error) {
//         res.status(500).json(err);
//     }
// }

// module.exports = { direccionRegister, direccionLogIn, getdireccionDetail, deletedireccion, updatedireccion };

module.exports = { direccionRegister, direccionLogIn, getDireccionDetail };
