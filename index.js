let express=require('express');
let app=express();
let mongoose=require('mongoose');
let bodyparser=require('body-parser');
app.use(bodyparser.urlencoded({extended:true}));
let upload=require('express-fileupload');
app.use(upload())
let admin=require('./Route/Admin');
app.use(express.static("public/"))
app.use("/",admin);

app.listen(1000);