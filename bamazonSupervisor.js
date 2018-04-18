var inquirer = require("inquirer");
var mysql = require("mysql");
var Table = require("cli-table");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: "password",
    database: "bamazon"
  });
  
    connection.connect(function(err) {
    if (err) throw err;
        runapp();

  });

function runapp(){
  inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "Which would you like to do?",
      choices: ["View Product Sales by Department","Create New Department","Exit"]
    }
  ])
  .then(function(answer){
      switch(answer.action){
        case "View Product Sales by Department":
          viewSales();
        break;
        case "Create New Department":
          createDepartment();
        break;
        case "Exit":
          connection.end();
        break;
      }
  })

};

function viewSales(){
  console.log("Displaying Sales");
  var query =   "SELECT departments.department_name, departments.over_head_cost, ROUND(SUM(products.product_sales),2) AS department_sales, ROUND(SUM(products.product_sales) - departments.over_head_cost,2) AS current_profits ";
  query += "FROM products ";
  query += "RIGHT JOIN departments ";
  query += "ON products.department_name = departments.department_name ";
  query += "GROUP BY products.department_name ";
  query += "ORDER BY department_sales DESC"

  connection.query(query, function(err,res){
    if(err) throw err;
    var table = new Table({
      head: ["Department", "Department OHC", "Department Sales", "Department POD (Col 3 - Col 2)"]
  
    });

    for(var i = 0; i< res.length; i++){
      if(res[i].department_sales == null){
        table.push([res[i].department_name, "$"+res[i].over_head_cost, "$0", "$0"]);
      }else{
        table.push([res[i].department_name, "$"+res[i].over_head_cost, "$" + res[i].department_sales, "$"+res[i].current_profits]);

      };
    };
    console.log(table.toString());
    runapp();
  })  
};

function createDepartment(){
  console.log("Loading information to add a new Department...");
  connection.query("SELECT department_name FROM departments",
  function(err,res){
    if(err) throw err;
    console.log("Displaying Current Departments...");
    var table = new Table({
      head: ["Current Departments"]
    });
    for(var i = 0; i< res.length; i++){
      table.push([res[i].department_name]);
    };
    console.log(table.toString());
    addDepartment();

    function addDepartment(){
      inquirer.prompt([
        {
          type: "input",
          name: 'name',
          message: "What is the name of the new Department you wish to add?"
        },
        {
          type: "confirm",
          name: "confirmation",
          when: function(answer){
            if(answer.name){
              console.log("The Department name will be " + answer.name +".")
              return true;
            }else return false;
          },
          message: "Is this okay?"
        }
      ])
      .then(function(data){
          if(data.confirmation){
            connection.query("INSERT INTO departments SET ?",
            {
              department_name: data.name,
              over_head_cost: 0
            },
            function(err){
              if(err) throw err;
              console.log("Department has been added.");
              runapp();
            }
           )
          }else {
            addDepartment();
          }
      })
    };
  
  });
};