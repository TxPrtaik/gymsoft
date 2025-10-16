let mongoose=require("mongoose")
let Schema=mongoose.Schema;
let Login_Schema=new Schema({
    "username":String,
    "password":String
})
module.exports=mongoose.model("Login_Model",Login_Schema)
