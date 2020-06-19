const express = require("express");
const app = express();
const mysql= require("mysql");
const http =require("https");
const ejs = require("ejs");
const bodyparser=require("body-parser");
const bcrypt = require("bcryptjs");
const url = require('url');
var nodemailer = require('nodemailer');

app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static(__dirname + "/public"));
app.set('view engine','ejs');

var con = mysql.createConnection(
{
	host:"localhost",
	user:"root",
	password:"Sp@16100790",
	database:"doctor"
});

let docname,zip,date,user;

app.post("/",function(req,res)
{
	console.log(req.body.doctorname);
	const doctorname=req.body.doctorname;
	const zipcode=req.body.zipcode;
	const queryObject = url.parse(req.url,true).query;
	console.log(queryObject.user);

	docname=doctorname;
	zip=zipcode;
	con.connect(function()
	{
		console.log('mysql connected');
		console.log(docname);
		con.query("select * from searchdoc where doctorname='"+docname+"' and zipcode='"+zip+"'",
		function(err,rows,fields)
		{
			if(rows.length > 0)
			{
				// let id=rows[0].did;
				con.query("select * from special where did='"+rows[0].did+"'",
				function(err,rows1,fields)
				{
					console.log(rows1);
					console.log(rows);
					res.render("doctorejs",{user:queryObject.user,data:rows,name:rows[0].doctorname,specializatn:rows1[0].specialization,qualificatn:rows1[0].qualification,hospital:rows1[0].hospital,zipcode:rows[0].zipcode});
				});
			}
			else
			{
				console.log('doctor not present');
					res.render("doctorejs",{user:queryObject.user,data:rows});
			}
		});	
	});
});

app.post("/login",async(req,res)=>
{
	try
	{
	const username=req.body.name;
	const number=req.body.phone;
	const password=req.body.pass;
	console.log(password);			
	user=username;


	var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:
    {
    user: 'spokharna2002@gmail.com',
    pass: '16100790'
  	}
	});

	var mailOptions = {
	  from: 'spokharna2002@gmail.com',
	  to: username,
	  subject: 'Sending Email using Node.js',
	  text: 'Welcome to Dochere.Hope we would be helpful to you.Enjoy!'
	};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});

	con.connect(function()
	{
		con.query("select exists(select * from patients where username='"+username+"')as user",
		function(err,rows1,fields)
		{
			if(rows1[0].user==1)
			{
				console.log('User already exists'); 
				return res.render('failedsignup');                                                            
			}
			else
			{
				const saltRounds=10;
				bcrypt.genSalt(saltRounds, function (err, salt) {
				  if (err) {
				    throw err
				  } else {
				    bcrypt.hash(password, salt, function(err, hash) {
				      if (err) {
				        throw err
				      } else {
				      	const hashedpassword=hash;
						var sql="insert into `patients`(`username`,`phone`,`password`)values('"+username+"','"+number+"','"+hashedpassword+"')";
						con.query(sql,function(result1)	
						{
							console.log('data inserted');
							console.log(username,number,hashedpassword);
						});
				      }
				    })
				  }
				})
				return res.render('main_pageejs',{user:username});
			}
		});				
		});
	}
	catch{
		res.redirect("/login.html");
	}

});

app.post("/signin",async(req,res)=>
{
	try{
	const username=req.body.name;
	const password=req.body.pass;
	let hashedpassword;
	
	con.connect(function()
	{
		con.query("select * from patients where username='"+username+"'",
		function(err,rows1,fields)
		{
			if(rows1.length > 0)
			{                 
				hashedpassword=rows1[0].password;
				console.log(rows1[0].password);                       
				bcrypt.compare(password, hashedpassword , function(err, isMatch) {
		        if (err) {
				    throw err
				} else if (!isMatch) {
				    console.log("Password doesn't match!")
					return res.render('failedsignin');
				} else {
				    console.log("Password matches!")
					return res.render('main_pageejs',{user:username});
				}
				})
			}
			else
			{
			    console.log("Password doesn't match!")
				return res.render('failedsignin');
			}
		});
					
	});
}
catch{
	res.redirect("/signin");
}
});

app.post("/doctorsignin",async(req,res)=>
{
	try{
	const username=req.body.name;
	const password=req.body.pass;
	let hashedpassword;
	console.log('doctor signin----------')	
	con.connect(function()
	{
		con.query("select * from doctorlogin where doctormail='"+username+"'",
		function(err,rows1,fields)
		{
			if(rows1.length > 0)
			{                 
				hashedpassword=rows1[0].password;
				console.log(rows1[0].password);                       
				bcrypt.compare(password, hashedpassword , function(err, isMatch) {
		        if (err) {
				    throw err
				} else if (!isMatch) {
				    console.log("Password doesn't match!")
					return res.render('failedsignin');
				} else {
				    console.log("Password matches!")
				    con.query("select did from doctorlogin where doctormail='"+username+"'",
			    	function(err,rows,fields)
			    	{
			    		console.log('did-----------')
			    		console.log(rows);
			    		con.query("select * from appointment where doctorid='"+rows[0].did+"' and date=curdate()",
			    		function(err,rows1,field)
			    		{
			    			console.log('appointment---------------');
			    			console.log(rows1);
							return res.render('doctorview',{data:rows1,doctorid:rows[0].did});
			    		});
			    	});
				}
				})
			}
			else
			{
			    console.log("Password doesn't match!")
				return res.render('failedsignin');
			}
		});
					
	});
}
catch{
	res.redirect("/signin");
}
});


app.get("/docfutureappointment",async(req,res)=>
{
	const queryObject = url.parse(req.url,true).query;
	console.log(queryObject.id);	

	console.log('doctor future appointenr----------')
	con.connect(function()
	{
		con.query("select * from appointment where doctorid='"+queryObject.id+"' and date>curdate()",
		function(err,rows1,field)
		{
			console.log('appointment---------------');
			console.log(rows1);
			return res.render('docfutureappointment',{data:rows1,doctorid:queryObject.id});
		});
    	});

});



app.post("/docsignup",async(req,res)=>
{
	const doctorname=req.body.doctorname;
	const qualification=req.body.qualification;
	const doctorzipcode=req.body.doctorzipcode;
	const specialisation=req.body.specialisation;
	const phone=req.body.phone;
	const hospital=req.body.hospital;
	const mail = req.body.doctoremail;
	const password = req.body.doctorpassword;
	con.connect(function()
	{
		con.query("insert into searchdoc(doctorname,zipcode,phone) values('"+doctorname+"','"+doctorzipcode+"','"+phone+"')",
		function(err,rows,fields)
		{});

		con.query("select did from searchdoc where doctorname='"+doctorname+"'",
		function(err,rows,fields)
		{
			console.log('rows---------')
			console.log(rows);
			// const hospital='fortis hospital';
			con.query("insert into special(did,specialization,qualification,hospital)values('"+rows[0].did+"','"+specialisation+"','"+qualification+"','"+hospital+"')",
			function(err,rows1,fields)
			{
				console.log(rows[0].did,specialisation,qualification,hospital);
				console.log('rows1--------')
				console.log(rows1);
				console.log('data inserted');
		 	});
			const saltRounds=10;
				bcrypt.genSalt(saltRounds, function (err, salt) {
				  if (err) {
				    throw err
				  } else {
				    bcrypt.hash(password, salt, function(err, hash) {
				      if (err) {
				        throw err
				      } else {
				      	const hashedpassword=hash;
						var sql="insert into `doctorlogin`(`did`,`doctormail`,`password`)values('"+rows[0].did+"','"+mail+"','"+hashedpassword+"')";
						con.query(sql,function(result1)	
						{
							console.log('data inserted');
							console.log(rows[0].did,mail,hashedpassword);
						});
				      }
				    })
				  }
				})
				// return res.render('main_pageejs',{user:username});
		
		});
		return res.redirect("/");
	});
});


app.post("/appointment",async(req,res)=>
{
	const queryObject = url.parse(req.url,true).query;
	console.log(queryObject);
	console.log(queryObject.doctor);
	const patientusername=queryObject.user;
	const doctor=queryObject.doctor;
	const patientname=req.body.patientname;
	const patientgender=req.body.patientgender;
	const patientage=req.body.patientage;
	const patientzipcode=req.body.patientzipcode;
	const specialisation=req.body.specialisation;
	const patientdate=req.body.patientdate;
	con.connect(function()
	{
		con.query("select * from patients where username='"+patientusername+"'",
		function(err,rows,fields)
		{
			console.log(rows);
			if(rows.length>0)
			{
				con.query("select did,phone from searchdoc where doctorname='"+doctor+"'",
				function(err,rowd,fields)
				{
					console.log(rowd);
					var transporter = nodemailer.createTransport({
				    service: 'gmail',
				    auth:
				    {
				    user: 'spokharna2002@gmail.com',
				    pass: '16100790'
				  	}
				});

					var mailOptions = {
					  from: 'spokharna2002@gmail.com',
					  to: patientusername,
					  subject: 'Sending Email using Node.js',
					  text: 'Your appointment with Dr. '+doctor+' is confirmed on date '+patientdate+'.For further details you can contact to you doctor with this number '+rowd[0].phone+'. Thank you.'
					};

				transporter.sendMail(mailOptions, function(error, info){
				  if (error) {
				    console.log(error);
				  } else {
				    console.log('Email sent: ' + info.response);
				  }
				});
					con.query("insert into appointment(id,doctorid,patientusername,patientname,gender,age,zipcode,date) values('"+rows[0].id+"','"+rowd[0].did+"','"+patientusername+"','"+patientname+"','"+patientgender+"','"+patientage+"','"+patientzipcode+"','"+patientdate+"')",
					function(err,rows1,fields)
					{
						console.log(rows[0].id,rowd[0].did,patientusername,patientname,patientgender,patientage,patientzipcode,specialisation,patientdate);
						console.log('data inserted');
				 	});
					return res.render('main_pageejs',{user:patientusername});
				});
				
			}
			else 
			{
				return res.render("loginejs",{account:'signup'});
			}	
		});
		
	});
});

app.get("/",function(req,res)
{
	res.sendFile(__dirname + "/main_page.html");
});

app.get("/appointment",function(req,res)
{
	const queryObject = url.parse(req.url,true).query;
	console.log(queryObject);
	con.connect(function()
	{
		con.query("select * from patients where username='"+queryObject.user+"'",
		function(err,rows,fields)
		{
			console.log(rows);	
		});
	});
	res.render("appointejs",{user:queryObject.user,doctor:queryObject.doctor});
});

app.get("/pastappointments",function(req,res)
{
	const doctors=[];
	let k=0;
	const queryObject = url.parse(req.url,true).query;
	console.log(queryObject.user);
	con.connect(function()
	{
		con.query("select * from appointment where patientusername='"+queryObject.user+"'",
		function(err,rows,fields)
		{
			if(rows.length>0)
			{
				console.log(rows.length);
				for(i=0;i<rows.length;i++)
				{
					con.query("select doctorname from searchdoc where did='"+rows[i].doctorid+"'",
					function(err,rows1,fields)
					{
						doctors.push(
						{
							name:rows1[0].doctorname
						});
						console.log(i);
						console.log(doctors);
						console.log(rows1[0].doctorname);
						if(i==rows.length)
						{
							k++;
							if(k==rows.length)
								res.render("pastappointments",{data:rows,doctors:doctors,length:rows.length});
						}

					});
				}
			}
			else
			{
				res.render("pastappointments",{data:rows,doctors:doctors,length:0});
			}
			// if(doctors.length==rows.length-1)
			// res.render("pastappointments",{username:queryObject.user,name:rows[0].patientname,gender:rows[0].gender,date:rows[0].date});
		});
	});
});

app.get("/deleteappointments",function(req,res)
{
	const doctors=[];
	let k=0;
	const queryObject = url.parse(req.url,true).query;
	console.log('DELETE APPOINTMENT');
	console.log(queryObject.user);
	con.connect(function()
	{
		con.query("select * from appointment where patientusername='"+queryObject.user+"'and date >= curdate()",
		function(err,rows,fields)
		{
			if(rows.length>0)
			{
				for(i=0;i<rows.length;i++)
				{
					con.query("select doctorname from searchdoc where did='"+rows[i].doctorid+"'",
					function(err,rows1,fields)
					{
						doctors.push(
						{
							name:rows1[0].doctorname
						});
						console.log(doctors);
						console.log(rows1[0].doctorname);
						if(i==rows.length)
						{
							k++;
							if(k==rows.length)
								res.render("deleteappointments",{data:rows,doctors:doctors});
						}

					});
				}
			}
			else
			{
				res.render("pastappointments",{data:rows,doctors:doctors,length:0});
			}
			// if(doctors.length==rows.length-1)
			// res.render("pastappointments",{username:queryObject.user,name:rows[0].patientname,gender:rows[0].gender,date:rows[0].date});
		});
	});
});


app.get("/docdeleteappointment",function(req,res)
{
	const queryObject = url.parse(req.url,true).query;
	console.log('DOCTOR DELETE APPOINTMENT');
	console.log(queryObject.user);
	console.log(queryObject.did);

	console.log('doctor delete appointment----------')
	con.connect(function()
	{
		con.query("delete from appointment where patientusername='"+queryObject.user+"' and doctorid ='"+queryObject.did+"' and date=curdate()",
		function(err,rows,fields)
		{
			console.log('after deletion-------')
			console.log(rows)
			var transporter = nodemailer.createTransport({
		    service: 'gmail',
		    auth:
		    {
		    user: 'spokharna2002@gmail.com',
		    pass: '16100790'
		  	}
			});

			var mailOptions = {
			  from: 'spokharna2002@gmail.com',
			  to: queryObject.user,
			  subject: 'Cancellation of Appointment',
			  text: 'We are sorry to inform you that your appointment has been cancelled.'
			};

			transporter.sendMail(mailOptions, function(error, info){
			  if (error) {
			    console.log(error);
			  } else {
		    	console.log('Email sent: ' + info.response);
		  	}
		});
			con.query("select * from appointment where doctorid='"+queryObject.did+"' and date=curdate()",
    		function(err,rows1,field)
    		{
    			console.log('appointment---------------');
    			console.log(rows1);
				return res.render("doctorview",{data:rows1,doctorid:queryObject.did});
    		});
		});
	});
});
	

app.get("/delete",function(req,res)
{
const doctors=[];
let k=0;
const queryObject = url.parse(req.url,true).query;
console.log('DELETE');

var event = new Date(queryObject.date);
let date = JSON.stringify(event)
date = date.slice(1,11)
console.log('DATE');
console.log(date);

console.log(queryObject);
con.connect(function()
{
	con.query("delete from appointment where date='"+date+"' and patientusername='"+queryObject.user+"'",function(err,rows,field)
	{});
	con.query("select * from appointment where patientusername='"+queryObject.user+"'and date >= curdate()",
	function(err,rows,fields)
	{

	if(rows.length>0)
	{
		for(i=0;i<rows.length;i++)
		{
			con.query("select doctorname from searchdoc where did='"+rows[i].doctorid+"'",
			function(err,rows1,fields)
			{
				doctors.push(
				{
					name:rows1[0].doctorname
				});
				console.log(i);
				console.log(doctors);
				console.log(rows1[0].doctorname);
				if(i==rows.length)
				{
					k++;
					if(k==rows.length)
						res.render("deleteappointments",{data:rows,doctors:doctors});
				}

				});
			}
		}
		else
		{
			res.render("pastappointments",{data:rows,doctors:doctors});
		}
		// if(doctors.length==rows.length-1)
		// res.render("pastappointments",{username:queryObject.user,name:rows[0].patientname,gender:rows[0].gender,date:rows[0].date});
	});
});
// res.render("deleteappointments",{data:rows,doctors:doctors});
});

app.get("/signin",function(req,res)
{
	res.sendFile(__dirname + "/signin.html");
});

app.get("/doctorsignin",function(req,res)
{
	res.sendFile(__dirname + "/doctorsignin.html");
});

app.get("/failedsignin",function(req,res)
{
	res.sendFile(__dirname + "/failedsignin.html");
});

app.get("/doctor",function(req,res)
{
	res.redirect("/login.html");
});

app.get("/docsignup",function(req,res)
{
	res.sendFile(__dirname + "/doctorsignup.html");
});

app.get("/login.html",function(req,res)
{
	res.sendFile(__dirname + "/login.html");
});

app.get("/about",function(req,res)
{
	res.sendFile(__dirname + "/aboutus.html");
});

app.get("/privacy",function(req,res)
{
	res.sendFile(__dirname + "/privacy.html");
});

app.get("/terms",function(req,res)
{
	res.sendFile(__dirname + "/tandc.html");
});

app.get("/manageappointment",function(req,res)
{
	const queryObject = url.parse(req.url,true).query;	
	console.log(queryObject.user);
	res.render("manageappointmentejs",{user:queryObject.user});
});

app.get("/newappointment",function(req,res)
{	
	const queryObject = url.parse(req.url,true).query;	
	console.log(queryObject.user);
	res.render("newappointmentejs",{user:queryObject.user});
});


app.get("/orthologist.html",function(req,res)
{
	res.sendFile(__dirname + "/Orthologist.html");
});


app.get("/healthcare",function(req,res)
{
	const queryObject = url.parse(req.url,true).query;
	const specialization=queryObject.care;
	const user=queryObject.user;
	console.log('Healthcare---------');
	console.log(specialization,user);
	con.connect(function()
	{
		con.query("select * from special where specialization='"+specialization+"'",
		function(err,rows,field)
		{
			const doctors=[];
			let k=0;
			console.log('rows----')
			console.log(rows);
			for(i=0;i<rows.length;i++)
			{
				con.query("select * from searchdoc where did='"+rows[i].did+"'",
				function(err,rows1,fields)
				{
					doctors.push(
					{
						name:rows1[0].doctorname,
						zipcode:rows1[0].zipcode,
					});
					console.log('doctors:');
					console.log(doctors);
					if(i==rows.length)
					{
						k++;
						if(k==rows.length)
							res.render("healthcareejs",{data:rows,doctors:doctors,user:user});
					}

				});
			}			
		});
	});

	// res.sendFile(__dirname + "/Orthologist.html");
});




// app.get("/eyedoc",function(req,res)
// {
// 	res.sendFile(__dirname + "/eyedoc.html");
// });

// app.get("/psychiatrist",function(req,res)
// {
// 	res.sendFile(__dirname + "/Psychiatrist.html");
// });

// app.get("/dermatology",function(req,res)
// {
// 	res.sendFile(__dirname + "/Dermatologist.html");
// });

// app.get("/dentist",function(req,res)
// {
// 	res.sendFile(__dirname + "/Dentist.html");
// });

// app.get("/obgyn",function(req,res)
// {
// 	res.sendFile(__dirname + "/Gyneacologist.html");
// });

// app.get("/ent",function(req,res)
// {
// 	res.sendFile(__dirname + "/ENT.html");
// });


app.listen(5000,(req,res)=>
{
	console.log('server 5000 is listening....');
});	















