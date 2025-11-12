require("dotenv").config();
const express = require("express");
const computerRouter = require ("./router/computerRouter");
const uploadRouter = require ("./router/uploadRouter.js");

const app= express();

//The public folder is where all paths begin
app.use(express.static("public"));

// Use routes
app.use("/", uploadRouter);
app.use(computerRouter);

app.listen(process.env.PORT, () =>{
    console.log("Listening on port 3000");
});



