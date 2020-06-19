var mysql=require('mysql');
var express=require('express');
var app=express();

// to get localhost:8000

app.get('/',function(request,response)
{
  fetchData(response);
  console.log('Done,Displayed Data);
});
// To connect with Database
var db=mysql.createConnection({
  host='localhost',
  user='username',
  password=' ',                    //put database password
  database:' Doc '        //database name
});

function executeQuery(sql,cb)           //cb isme any function
{
  db.query(sql,function(error,result,fields)
  {
      if(error)
        {
          throw error;
        }
      cb.(result);

  })
}
// connection with database

db.connect(function(err)
{
    if(err)
    {
      throw error;
    }
    console.log('Connected to Database');
}

function fetchData(response){
  executeQuery("Select * from Admin",function(result)   //command query for it name to be changed
  {
    console.log(result);
    response.write('<table><tr>');
    for(var column in result[0])
    {
      response.write('<td><label>'+column + '</label></td>');
      res.write('</tr>');
    }
    for(var row in result)
    {
      response.write('<tr>');
      for(var column in result[row])
      {
          reponse.write('<td><label>'+result[row][column]+'</label></td>');
      }
      response.write('</tr>');
    }
    response.end('</table>');
  });
}

app.listen(1000,function()    //for listening at port
{
  console.log ('Listening to Port');

})
