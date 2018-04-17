var inquirer = require("inquirer");
var mysql = require("mysql");
var Table = require("cli-table");

var table = new Table({
    head: ["Item ID", "Item", "Department", "Price"]

});

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
    displayItems();

  });






  function displayItems(){
    var items = [];
    connection.query("SELECT * FROM products", function(err,res){
        if(err) throw err;

        for(var i = 0; i < res.length; i++){
            table.push(
                [res[i].item_id,res[i].product_name, res[i].department_name, "$" + res[i].price]
            );
            items.push(res[i].name);
        };

        console.log(table.toString());

        purchase();
    });
  };

  function purchase(){
      connection.query("SELECT * FROM products", function(err,res){
          if(err) throw err;
          var arr = [];
          for(var i = 0; i < res.length; i++){
            arr.push(res[i].item_id.toString());
          };

         
          inquirer.prompt([
              {
                  type: "list",
                  name: "choice",
                  message: "Choose which product to by based on ID.",
                  choices: arr
              },
              {
                  type: "input",
                  name: "amount",
                  message: "How many units would you like to purchase?",
                  validate: function(input){
                      if(isNaN(input)){
                          return false;
                      }else return true;
                  }
              }
          ])
          .then(function(answer){
              var productID = parseInt(answer.choice);
              var amount = answer.amount;
              checkStock(productID, amount);

          })

      })
  };

  function checkStock(productID, amtReq){
    console.log(productID);
    connection.query("SELECT * FROM products WHERE ?",[{
        item_id: productID 
    }],
    function(err,res){
        if(err) throw err;
    
        
        var productName = res[0].product_name;
        var stock = res[0].stock_quantity;
        var price = res[0].price;
        if(amtReq <= stock){
            var newStock = stock - amtReq;
            var cost = price * amtReq;
            connection.query("UPDATE products SET stock_quantity = ? WHERE product_name = ?", [newStock, productName],
            function(err,res){
                if(err) throw err;
                console.log("Your total is $" + cost);
                console.log("")
            })
        }else{
            console.log("Insufficient quantity!");
    
        };
        connection.end();
    });
  };