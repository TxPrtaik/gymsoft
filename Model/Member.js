let mongoose=require('mongoose');
let Schema=mongoose.Schema;
let member_shcema=new Schema({
    "name":String,
    "image":String,
    "mobile":String,
    "membership":String,
    "join_date":Date,
    "membership_started":Date,
    "membership_ending":Date,
    "membership_status":String,
    "payment_status":String,
    "plan_id":String,
    "plan_name":String,
    "plan_fees":String,
    "paid_fees":String
})
let model=mongoose.model("members",member_shcema);
module.exports=model;