require("dotenv").config();
const express = require("express");
const computerRouter = require ("./router/computerRouter");

const app= express();

app.use(express.static("public"));

app.use(computerRouter);

app.listen(process.env.PORT, () =>{
    console.log("Listening on port 3000");
});



