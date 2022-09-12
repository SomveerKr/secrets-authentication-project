require('dotenv').config()
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const encrypt=require("mongoose-encryption");
//for simpler hashing 
    // const md5=require("md5");
//for harder hashing and salting and a industry standard for secuiring user password
const bcrypt=require("bcrypt");
const saltRounds = 10;


const app=express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema=new mongoose.Schema({
    email:String,
    password:String
});


userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

const User=new mongoose.model("User", userSchema);


app.get("/", (req, res)=>{
    res.render("home")
})
app.get("/register", (req, res)=>{
    res.render("register");

})
app.get("/login", (req, res)=>{
    res.render("login")
})


app.post("/register", (req, res)=>{
    password=req.body.password;
    bcrypt.hash(password, saltRounds, function(err, hash) {
        const newUser=new User({
            email:req.body.username,
            password:hash
        })
        newUser.save((err)=>{
            if(!err){
                res.render("secrets");
            } else {
                console.log(err)
            }
        })
    });

})
app.post("/login", (req, res)=>{
    const username=req.body.username;
    const password=req.body.password;

    User.findOne({ email:username }, 
        (err, foundUser)=>{
            if(!err){
                if(foundUser){
                    bcrypt.compare(password, foundUser.password, function(err, result) {
                        if(result===true){
                            res.render("secrets")
                        }
                    });
                }
            } else {
                console.log(err)
            }
        }
    )
})

app.listen(3000, ()=>{
    console.log("Server has started on port 3000")
})