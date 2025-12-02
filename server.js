require("dotenv").config();
const express = require("express");

const computerRouter = require ("./routers/computerRouter.js");
const uploadRouter = require ("./routers/uploadRouter.js");
const computerManufacturerRouter= require ("./routers/computerManufacturerRouter.js");
const userRouter = require ("./routers/userRouter.js");

const app= express();

//The public folder is where all paths begin
app.use(express.static("public"));

// Use routes
app.use("/", uploadRouter);
app.use(computerRouter);
app.use(computerManufacturerRouter);
app.use(userRouter);

app.listen(process.env.PORT, () =>{
    console.log("Listening on port 3000");
});
