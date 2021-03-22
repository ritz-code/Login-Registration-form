require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const validator = require('validator');
var bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");

require("./db/conn");
const Logindata = require("./models/registers");

const port = process.env.PORT || 8000;

//path for static files
const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(cookieParser())
app.use(express.json()); 
app.use(express.urlencoded({extended:false})); 
app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/home", auth, (req, res) => {
    console.log("auth HOME PAGE BUDDY");
    res.render("home");
});

app.post("/login", async (req, res) => {
    try{
        const loginData = await Logindata.findOne({email: req.body.email});

        const comparePassword = await bcrypt.compare(req.body.password, loginData.password);

        const token = await loginData.generateAuthToken(); 

        res.cookie("jwt", token, {
            expires:new Date(Date.now() + 50000),
            httpOnly:true
        });

        if(comparePassword){
        res.status(201).render("home", {username: loginData.fullname});
        }
    }catch (error) {
        console.log("Login error "+error);
    }
});

app.post("/register", async (req, res) => {
    try{
        const loginData = new Logindata({
        fullname: req.body.fullname,
        email: req.body.email,
        password: req.body.password
        });

        const token = await loginData.generateAuthToken(); 

        res.cookie("jwt", token, {
            expires:new Date(Date.now() + 30000),
            httpOnly:true
        });

        const registered = await loginData.save();
        res.status(201).render("register");

    }catch(error){
        const errString = error.message;

        var errorMessage1="", errorMessage2="", errorMessage3 = "";

        if(req.body.fullname === "") {
            errorMessage1 = "Name is required";
        }
        if(req.body.email === "") {
            errorMessage2 = "Email is required";
        } else if(errString.indexOf("email") > 0) {
            errorMessage2 = "Invalid Email. Try again!";
        }
        if(req.body.password === "") {
            errorMessage3 = "Password is required";
        } else if(errString.indexOf("password") > 0) {
            errorMessage3 = "Try again!";
        }

        res.status(400).render("register", {errorMsg1: errorMessage1, errorMsg2: errorMessage2, errorMsg3: errorMessage3});
    }
});

app.listen(port, () => {
    console.log(`server is running at port ${port}`);
});
