let mongoose=require('mongoose');
let n_sc=new mongoose.Schema({
    "name":String,
    "number":String,
    "details":String,
    "date":String
})
module.exports=mongoose.model("notes",n_sc);