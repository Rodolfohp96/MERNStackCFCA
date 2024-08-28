const nodemailer = require('nodemailer');

// Configurar el transporte de nodemailer utilizando las credenciales proporcionadas
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'felipecarbajalarcia@gmail.com',
        pass: 'acyhtagclztpxyse',
    },
});

const sendEmail = async (req, res) => {
    const { to, subject, htmlContent, attachment } = req.body;

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'felipecarbajalarcia@gmail.com',
            pass: 'acyhtagclztpxyse',
        },
    });

    let mailOptions = {
        from: 'Colegio Felipe Carbajal Arcia <felipecarbajalarcia@gmail.com>',
        to: to,
        subject: subject,
        html: htmlContent,
        attachments: [
            {
                filename: attachment.filename,
                content: attachment.content,
                encoding: attachment.encoding,
            },
        ],
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Correo enviado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al enviar el correo', error });
    }
};

module.exports = {
    sendEmail,
};
