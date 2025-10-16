let mongoose=require("mongoose");
let Schema=mongoose.Schema;
let em=new Schema({
    "name":String,
    "mobile":String,
    "image":String,
    "date":String
})
let model=mongoose.model("EnquiryMember",em);
module.exports=model;