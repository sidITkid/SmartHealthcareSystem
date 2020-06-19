	const express = require("express");
	const http =require("https");
	const app = express();
	const bodyparser=require("body-parser")
	const mysql=require("mysql");

	app.use(bodyparser.urlencoded({extended:true}));
	app.use(express.static(__dirname + '/public'));

	var user,phone1,pass,userpass;

	var con=mysql.createConnection(
	{
		host:"localhost",
		user:"root",
		password:"Sp@16100790",
		database:"lab1"
	});

	app.post("/",function(req,res)
	{
		const username=req.body.name;
		const number=req.body.phone;
		const password=req.body.pass;

		user=username;
		phone1=number;
		pass=password;
		con.connect(function()
	{
		// console.log('mysql connected');
		// con.query("create table customer1(id INT AUTO_INCREMENT PRIMARY KEY, username varchar(255))",function(result){
		// 	console.log('inserted' + result);
		// });
		var sql="insert into `customers`(`username`,`phone`,`password`)values('"+user+"','"+phone1+"','"+password+"')";
		con.query(sql,function(result1)
		{
			console.log('data inserted');
		});
		con.query("select * from customers where id=(select max(id) from customers)",function(err,rows,field)
		{
			if(err)
				throw err;
			else
				{
					userpass=rows[0].username;
					console.log("user:- " +userpass);
				}
		})
	});

		
		console.log(username,phone1,password);
		// res.write("<h1>username "+username + "</h1>" + "<h2> phone number is "+number +"</h2>"
		//  + "<h3> and password is " + password+"</h3>");
		return res.redirect("/nhome");
		res.send();
	});

	
	app.get("/submit",function(req,res)
	{
		res.sendFile(__dirname + "/submit.html");
	});

	app.get("/login.html",function(req,res)
	{
		res.sendFile(__dirname + "/login.html");
	});

	app.get("/profile.html",function(req,res)
	{
		res.sendFile(__dirname + "/profile.html");
	});

	app.get("/nhome",function(req,res)
	{
		res.sendFile(__dirname + "/nhome.html",{name:userpass});
	});

	app.get("/",function(req,res)
	{
		res.sendFile(__dirname + "/home.html");
	});

	app.listen(5000,function()
	{
		console.log('server 5000 is listening');
	})