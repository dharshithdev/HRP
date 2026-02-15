const mongoose = require("mongoose");
require("dotenv").config();

const connectToDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected To Database Successfully : HRP!");
    } catch (error) {
        console.log(`Failed to Connect to Database, Error : ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectToDB;