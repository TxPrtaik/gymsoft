let express =require('express');
let route=express.Router();
let Plan=require('../Model/Plan');
let Mem=require('../Model/Member');
let not=require('../Model/Note');
let delMem=require('../Model/DeleteMem');
let EnqMem=require("../Model/EnqMem")
let Login=require("../Model/Login")
let jwt=require("jsonwebtoken")
let cookieparser=require("cookie-parser")
function authenticateAdmin(req,res,next){
  
let token=req.cookies.token;

if(!token) return res.redirect("/login")
jwt.verify(token,"pratik@123",(err,user)=>{
   if(err){
   res.status(400).json({"err":"user is not valid"})
   }
  req.user=user
  next()
})
}

route.get("/login",(req,res)=>{
   res.render("login.ejs")
})


route.post("/login",async(req,res)=>{
let data=await Login.findOne({"username":req.body.username,"password":req.body.password})
if(data){
let token=jwt.sign({"id":data._id},"pratik@123",{expiresIn:"2h"})
res.cookie("token",token)
res.redirect("/")
}
else{
   res.redirect("/login?warn=wrong_credentials")
}

//await Login(req.body).save()

})








route.get("/",authenticateAdmin,async(req,res)=>{
res.redirect('/members')
})
let  checkActive =async()=>{
   let mem=await Mem.find();
   
   for(let m of mem){
      if(new Date(m.membership_ending.toString()).toISOString().slice(0,10)<new Date().toISOString().slice(0,10)){
        let upmem=await Mem.findById(m._id).updateOne({membership_status:"due"});

   
      }
   }
   
}
route.get('/add-member',authenticateAdmin,async(req,res)=>{
     let d=await Plan.find();
     let members=await Mem.find();
     let memberMobile=[];
     for(let m of members){
      memberMobile.push(m.mobile);
     }
     let obj={
      "plans":d,
      "mobiles":memberMobile
     }
   res.render('addmember.ejs',obj); 
})
route.get('/members',authenticateAdmin,async(req,res)=>{
   let d=await Mem.find({membership_status:'active'});
    checkActive();
    let obj={
       "members":d,
      
    }
  
   
 res.render('memberstable.ejs',obj);
})
route.get('/add-plan',authenticateAdmin,async(req,res)=>{
   let d=await Plan.find();
   let obj={
      "plan":d
   }
   res.render('addplan.ejs',obj);
   })
   route.post('/save-plan',async(req,res)=>{
    req.body.modified_date=new Date().toString();
        let d=await Plan(req.body).save();
        if(d.length!=0){
           res.redirect('/add-plan');
        }

     
   })
   route.post('/update-plan/:id',async(req,res)=>{
      req.body.modified_date=new Date().toString();
      let d=await Plan.findById(req.params.id).updateOne(req.body);
   
      if(d.length!=0){
         let mems=await Mem.find({membership:req.params.id}).updateMany({plan_fees:req.body.plan_fees});
if(mems.length!=0)
{
   res.redirect('/add-plan');
}
         
      }
   })
   route.post("/save-member",async(req,res)=>{
       let d=new Date();
       let p=await Plan.findById(req.body.membership);
       if(req.files){
       req.body.image=new Date().getTime()+req.files.pfp.name
       req.files.pfp.mv("./public/img/"+req.body.image)
       
       d.setDate(Number(d.getDate())+Number(p.plan_days));
   req.body.plan_name=p.plan_name
   req.body.plan_fees=p.plan_fees;
   
  req.body.membership_status='active';
//   req.body.membership=req.body.membership.split(" ")[0];
//   let p=await Plan.findOne({'plan_days':req.body.membership});
//   req.body.plan_id=p._id;
  req.body.join_date=new Date().toString().slice(4,15);
  req.body.membership_started=new Date().toString().slice(4,15);
  req.body.membership_ending=d.toString().slice(4,15);

   let data=Mem(req.body).save();
        if(data.length!=0){
         res.redirect(`https://wa.me/${req.body.mobile}?text= *${req.body.name}*,%0A%0Aआपल्या जिम सदस्यतेसाठी फी ${req.body.paid_fees} rupees यशस्वीरित्या भरली गेली आहे. आपली सदस्यता ${req.body.membership_started}आणि ${req.body.membership_ending} पर्यंत वैध राहील.%0Aआमची सेवा निवडल्याबद्दल धन्यवाद! आपल्याला काही प्रश्न असल्यास कृपया आमच्याशी संपर्क साधा.%0A%0Aसादर,%0A*D-fitness*`);
         
    
   
     
     }
       }
       else{
   
   
       d.setDate(Number(d.getDate())+Number(p.plan_days));
   req.body.plan_name=p.plan_name
   req.body.plan_fees=p.plan_fees;
   req.body.image="default.png";
  req.body.membership_status='active';
//   req.body.membership=req.body.membership.split(" ")[0];
//   let p=await Plan.findOne({'plan_days':req.body.membership});
//   req.body.plan_id=p._id;
  req.body.join_date=new Date().toString().slice(4,15);
  req.body.membership_started=new Date().toString().slice(4,15);
  req.body.membership_ending=d.toString().slice(4,15);

   let data=Mem(req.body).save();
        if(data.length!=0){
         res.redirect(`https://wa.me/${req.body.mobile}?text= *${req.body.name}*,%0A%0Aआपल्या जिम सदस्यतेसाठी फी ${req.body.paid_fees} rupees यशस्वीरित्या भरली गेली आहे. आपली सदस्यता ${req.body.membership_started}आणि ${req.body.membership_ending} पर्यंत वैध राहील.%0Aआमची सेवा निवडल्याबद्दल धन्यवाद! आपल्याला काही प्रश्न असल्यास कृपया आमच्याशी संपर्क साधा.%0A%0Aसादर,%0A*D-fitness*`);
         
    
   
     
     }
   }

   })
    route.post("/renew-membership/:id",async(req,res)=>{
       let d=new Date(req.body.date);
       
       let plan=await Plan.findById(req.body.membership);
       d.setDate(d.getDate()+Number(plan.plan_days));
//        req.body.membership=req.body.membership.split(" ")[0];
//        let p=await Plan.findOne({'plan_days':req.body.membership});
// req.body.plan_id=p._id;
req.body.plan_name=plan.plan_name;
req.body.plan_fees=plan.plan_fees;

       req.body.membership_status='active';
       req.body.membership_started=new Date(req.body.date).toString().slice(4,16);
       req.body.membership_ending=d.toString().slice(4,16);
      
         let data=await Mem.findById(req.params.id).updateOne(req.body);
         
         if(data.length!=0){
         let mem=await Mem.findById(req.params.id);
           
      
               res.redirect(`https://wa.me/${mem.mobile}?text= *${mem.name}*,%0A%0Aआपल्या जिम सदस्यतेसाठी फी ${mem.paid_fees} rupees यशस्वीरित्या भरली गेली आहे. आपली सदस्यता ${mem.membership_started.toString().slice(4,15)}आणि ${mem.membership_ending.toString().slice(4,15)} पर्यंत वैध राहील.%0Aआमची सेवा निवडल्याबद्दल धन्यवाद! आपल्याला काही प्रश्न असल्यास कृपया आमच्याशी संपर्क साधा.%0A%0Aसादर,%0A*D-fitness*`);

           

         }
      
    })
   route.post('/update-payment-status/:id',async(req,res)=>{
   let d=await Mem.findById(req.params.id).updateOne(req.body);
   if(d.length!=0){
      res.redirect('/members');
   }
   })
  
   route.get('/due-members',authenticateAdmin,async(req,res)=>{
     let d=await Mem.find();
   
     for( let i of d){
 
      if(new Date().toString().slice(4,15)==i.membership_ending.toString().slice(4,15)){
        
         let f=await Mem.findById(i._id).updateOne({membership_status:'due'});
     }
   
   }
     let data=await Mem.find({membership_status:'due'});
     const sorted = data.sort((a, b) => {
  const dateA = new Date(a.membership_ending.toString().slice(4, 15)).getTime();
  const dateB = new Date(b.membership_ending.toString().slice(4, 15)).getTime();
  return dateB - dateA; 
});
     let p=await Plan.find();
   let obj={
      "members":sorted,
      "plans":p
   }
 
   
   res.render('duemembers.ejs',obj);
   })

   route.get("/delete-member/:id",authenticateAdmin,async(req,res)=>{
      
let  member=await Mem.findById(req.params.id);
let del_mem={
   "name":member.name,
   "image":member.image,
   "mobile":member.mobile,
   "last_mem":member.plan_name,
   "paid_fees":member.paid_fees,
   "plan_fees":member.plan_fees,
   "delete_date":new Date().toISOString().slice(0,10)
}
let a=await delMem(del_mem).save();
    let d=await Mem.findById(member._id).deleteOne();




         res.redirect('/members');
      
   })
   route.post('/update_paid_fees/:id',async(req,res)=>{
      let d=await Mem.findById(req.params.id);
    d.paid_fees=Number(d.paid_fees)+Number(req.body.paid);
    if(d.paid_fees==d.plan_fees){
      d.payment_status='Paid'
    }
   let data=await Mem.findById(req.params.id).updateOne(d);
   
       if(data.length!=0){
         let mem=await Mem.findById(req.params.id);
         if(d.payment_status=='Paid'){
            res.redirect(`https://wa.me/${mem.mobile}?text= *${mem.name}*,%0A%0Aआम्हाला कळविते की, आपल्या जिम सदस्यतेसाठी फी ${mem.paid_fees} rupees यशस्वीरित्या भरली गेली आहे. आपली सदस्यता ${mem.membership_started.toString().slice(4,15)}आणि ${mem.membership_ending.toString().slice(4,15)} पर्यंत वैध राहील.%0Aआमची सेवा निवडल्याबद्दल धन्यवाद! आपल्याला काही प्रश्न असल्यास कृपया आमच्याशी संपर्क साधा.%0A%0Aसादर,%0A*D-fitness*`);

         }
         else{
          res.redirect(`https://wa.me/${mem.mobile}?text=*${mem.name}*,%0Aआम्हाला आनंद होतो की आपली जिम सदस्यता फी ${req.body.paid} यशस्वीपणे जमा करण्यात आली आहे. आपल्या वेगवान भरण्याबद्दल धन्यवाद!%0Aआपला सततचा पाठिंबा आमच्या सुविधा आणि सेवा सुधारण्यासाठी मदत करतो. आपल्याला कोणतेही प्रश्न असतील किंवा मदतीची आवश्यकता असेल, तर कृपया आमच्याशी संपर्क साधा.%0A%0Aआम्ही आपल्याला जिममध्ये भेटण्यासाठी उत्सुक आहोत!%0A%0Aआपला आभार,!%0A *D-fitness Zone*`)
         }
         }
   })
   route.get("/enquiry",authenticateAdmin,async(req,res)=>{
     let pl=await Plan.find();
     let mems=await EnqMem.find();
     let obj={
      "plans":pl,
"mems":mems
   }
     res.render("notes.ejs",obj);
   })
   route.post("/save-enq-mem",async(req,res)=>{
      req.body.date=new Date().toISOString().slice(0,10);
      let d=await EnqMem(req.body).save();

      res.redirect("/enquiry");
   })
   route.get("/delete-note/:id",authenticateAdmin,async(req,res)=>{
      let d=await not.findById(req.params.id).deleteOne();
      res.redirect('/notes');
   })
   route.post("/video",async(req,res)=>{
     
      req.files.vdo.mv("public/"+req.files.vdo.name);
      res.send(req.files.vdo.name+"")
   })
route.get("/deleted-mems",async(req,res)=>{
let d=await delMem.find();
let obj={
"mem":d
}
res.render("delmem.ejs",obj);
})
route.post("/start-enq-mem/:id",async(req,res)=>{
   let memb=await EnqMem.findById(req.params.id);
   let membership_det=await Plan.findById(req.body.membership);
   req.body.join_date=new Date().toISOString().slice(0,10);
   req.body.name=memb.name;
   req.body.mobile=memb.mobile;
   req.body.plan_name=membership_det.plan_name;
   req.body.plan_fees=membership_det.plan_fees;
   let startDate=new Date(req.body.start_date);
   startDate.setDate(Number(startDate.getDate())+Number(membership_det.plan_days));
   req.body.membership_started=new Date(req.body.start_date).toISOString().slice(0,10);
   req.body.membership_status="active";
req.body.membership_ending=startDate.toISOString().slice(0,10);
req.body.image="default.png"
 let d=await Mem(req.body).save();
await EnqMem.findById(req.params.id).deleteOne();

res.redirect(`https://wa.me/${req.body.mobile}?text= *${req.body.name}*,%0A%0Aआपल्या जिम सदस्यतेसाठी फी ${req.body.paid_fees} rupees यशस्वीरित्या भरली गेली आहे. आपली सदस्यता ${req.body.membership_started}आणि ${req.body.membership_ending} पर्यंत वैध राहील.%0Aआमची सेवा निवडल्याबद्दल धन्यवाद! आपल्याला काही प्रश्न असल्यास कृपया आमच्याशी संपर्क साधा.%0A%0Aसादर,%0A*D-fitness*`);


})
route.post("/update-image/:id",async(req,res)=>{
   req.body.image=new Date().getTime()+req.files.img.name
   req.files.img.mv("./public/img/"+req.body.image)
await Mem.findById(req.params.id).updateOne({"image":req.body.image})
   res.redirect("/members")
})
route.get("/logout",authenticateAdmin,async(req,res)=>{
res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });
  res.redirect("/")
})
route.get("/permanant-del/:id",authenticateAdmin,async(req,res)=>{
  await delMem.findById(req.params.id).deleteOne();
  res.redirect("/deleted-mems")
})
module.exports=route;
