const cors = require("cors");
const express = require("express");
const path = require("path");
const connectToDB = require("./Config/Connect");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

connectToDB().then(() => {
    app.listen(PORT, () => {
        console.log("Server Running on PORT ", PORT);
    });
});

