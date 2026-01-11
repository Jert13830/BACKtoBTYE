require("dotenv").config();
const express = require("express");
const session = require('express-session');

const computerRouter = require ("./routers/computerRouter.js");
const uploadRouter = require ("./routers/uploadRouter.js");
const computerManufacturerRouter = require ("./routers/computerManufacturerRouter.js");
const userRouter = require ("./routers/userRouter.js");
const softwareRouter = require ("./routers/softwareRouter.js");
const softwareManufacturerRouter = require ("./routers/softwareManufacturerRouter.js");
const emulatorRouter = require ("./routers/emulatorRouter.js");
const emulatorManufacturerRouter = require ("./routers/emulatorManufacturerRouter.js");

const app= express();

// Holds login status
app.locals.loginStatus = false;

// Parse form data
app.use(express.urlencoded({ extended: true }));

// Parse JSON
app.use(express.json());

//The public folder is where all paths begin
app.use(express.static("public"));

app.use(session({
    //key:'user_id', //makes session unique - needed for creating and distroying cookies
    secret: 'keep_your_nose_out_of_my_business', //need for hashing, the longer then harder it is to decrypt
    resave: true, //normally set to false - the session shouldn't be saved evrytime 
    saveUninitialized: true, //normally set to false - otherwise a new session is create each time a page is loaded - using lots of RAM
  /*  cookie:{
        expires: 600000 //duration calculated in seconds - about a week - 7d x 24h x 60m x 60s = 604800 seconds 
    }*/
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Use routes
app.use("/", uploadRouter);
app.use(computerRouter);
app.use(computerManufacturerRouter);
app.use(userRouter);
app.use(softwareRouter);
app.use(softwareManufacturerRouter);
app.use(emulatorRouter);
app.use(emulatorManufacturerRouter);

app.listen(process.env.PORT, () =>{
    console.log("Listening on port 3000");
});


