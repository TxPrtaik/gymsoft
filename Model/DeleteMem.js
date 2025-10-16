let mongoose=require('mongoose');

let Schema=mongoose.Schema;
let del_sch=new Schema({
    "name":String,
    "image":String,
    "mobile":String,
    
    "last_mem":String,
    "paid_fees":String,
    "plan_fees":String,
    "delete_date":String
})
module.exports=mongoose.model("DeleteMem",del_sch);