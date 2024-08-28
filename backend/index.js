const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb+srv://rodolfohp96:PichitoMongo124.@cfca.dm0yu3f.mongodb.net/?retryWrites=true&w=majority&appName=CFCA/cfca';
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = express();
const Routes = require("./routes/route.js");
const Student = require("./models/studentSchema.js");
const Sclass = require("./models/sclassSchema.js");
const Tuition = require("./models/tuitionSchema.js");
const bcrypt = require("bcrypt");

dotenv.config();

app.use(express.json({ limit: '50mb' }));
app.use(cors());

mongoose
    .connect(MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(async () => {
        console.log("Connected to MongoDB");

    
  })
  .catch((err) => console.log("NOT CONNECTED TO NETWORK", err));

app.use('/', Routes);

app.listen(PORT, () => {
  console.log(`Server started at port no. ${PORT}`);
});