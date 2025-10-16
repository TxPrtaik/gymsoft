let mongoose=require('mongoose');
mongoose.connect('mongodb+srv://pratikchindhe44:pratik123@cluster0.z8syx.mongodb.net/Dfitness');
let Schema=mongoose.Schema;
let plan_schema=new Schema({
    "plan_name":String,
"plan_days":String,
"plan_fees":String,
"modified_date":Date
})
let model=mongoose.model("plans",plan_schema);
module.exports=model;

