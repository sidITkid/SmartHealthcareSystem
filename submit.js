
const express = require("express");
const http =require("https");
const app = express();
const bodyparser=require("body-parser")
const mysql=require("mysql");

app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static(__dirname + '/public'));
app.set('view engine','ejs');

var user,phone1,pass,uid,userpass;
let flag=0;

var con=mysql.createConnection(
{
	host:"localhost",
	user:"root",
	password:"Sp@16100790",
	database:"lab1"
});

app.post("/login",function(req,res)
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
		con.query("select exists(select * from customers where username='"+user+"')as user",
		function(err,rows1,fields)
		{
			if(rows1[0].user==1)
			{
				console.log('User already exists');                                                             
            	// return err;
				// console.log(rows1);
				// console.log('data cant be inserted');
				// return res.redirect("/invalidlogin");
			}
			else
				{
					var sql="insert into `customers`(`username`,`phone`,`password`)values('"+user+"','"+phone1+"','"+password+"')";
					con.query(sql,function(result1)	
					{
						console.log('data inserted');
					});

					console.log(username,phone1,password);
					// res.write("<h1>username "+username + "</h1>" + "<h2> phone number is "+number +"</h2>"
					//  + "<h3> and password is " + password+"</h3>");
					// return res.redirect("/nhome");

				}
		});
					
});
		// res.send();
});


app.get("/submit",function(req,res)
{
	res.sendFile(__dirname + "/submit.html");
});

app.get("/login.html",function(req,res)
{
	res.sendFile(__dirname + "/login.html");
});

app.get("/invalidlogin",function(req,res)
{
	res.sendFile(__dirname + "/invalidlogin.html");
});

app.get("/profile.html",function(req,res)
{
	res.sendFile(__dirname + "/profile.html");
});

app.get("/nhome",function(req,res)
{
	// var id=erq.params.uid;
	con.connect(function()
	{
		con.query("select * from customers where id=(select max(id) from customers)",function(err,rows,field)
		{
			userpass=rows[0].username;
			uid=rows[0].id;
			console.log(userpass);
		});
	});
	res.render('ejs1.ejs',{ uname:userpass});
	// console.log(table);
});

app.get("/",function(req,res)
{
	res.sendFile(__dirname + "/home.html");
});

app.listen(5000,function()
{
	console.log('server 5000 is listening');
});