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
            name: "option",
            message: "Which would you like to do?",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
        }
    ])
    .then(function(choice){
        switch(choice.option){
            case "View Products for Sale":
                displayItems();
            break;
            case "View Low Inventory":
                displayLowItems();
            break;
            case "Add to Inventory":
                addStock();
            break;
            case "Add New Product":
                addNewProduct();
            break;
        }
    })
}

function displayItems(){

    var table = new Table({
        head: ["Item ID", "Item", "Department", "Price", "Stock"]
    
    });
   
    connection.query("SELECT * FROM products", function(err,res){
        if(err) throw err;

        for(var i = 0; i < res.length; i++){
            table.push(
                [res[i].item_id,res[i].product_name, res[i].department_name, "$" + res[i].price, res[i].stock_quantity]
            );
          
        };
  
        console.log(table.toString());
        runapp();
        });
 
  };

function displayLowItems(){

    var table = new Table({
        head: ["Item ID", "Item", "Department", "Price", "Stock"]
    
    });
    connection.query("SELECT * FROM products WHERE stock_quantity <= 20", function(err,res){
        if(err) throw err;

        for(var i = 0; i < res.length; i++){
            table.push(
                [res[i].item_id,res[i].product_name, res[i].department_name, "$" + res[i].price, res[i].stock_quantity]
            );
   
        };

        console.log(table.toString());
        runapp();
    });
};


function addStock(){
    var table = new Table({
        head: ["Item ID", "Item", "Department", "Price", "Stock"]
    
    });
    connection.query("SELECT * FROM products", function(err, res){
        if(err) throw err;
    
        for(var i = 0; i < res.length; i++){
            table.push(
                [res[i].item_id,res[i].product_name, res[i].department_name, "$" + res[i].price, res[i].stock_quantity]
            );
        
        };
        console.log(table.toString());
        inquirer
          .prompt([
            {
                name: "choice",
                type: "list",
                choices: function(){
                    var choicesArray = [];
                    for(var i = 0; i < res.length; i++){
                        choicesArray.push(res[i].item_id.toString());
                    };
                    return choicesArray;
                },
                message: "Select the Item ID for the item you wish to add"
            },
            {
                name: "amount",
                type: "input",
                message: "How much inventory would you like to add?",
                validate: function(input){
                    if(isNaN(input)){
                        if(parseFloat(input) % 1 !== 0){
                            console.log("Please enter an integer.");
                            return false;
                        }
                        console.log("Please enter a number.");
                        return false;
                    }else{
                        return true;
                    };
                }
            }
        ])
        .then(function(data){
                var newStock = res[parseInt(data.choice) - 1].stock_quantity + parseInt(data.amount);
              
                console.log(parseInt(data.amount));
                console.log("New Stock: " + newStock);
                connection.query("UPDATE products SET ? WHERE ?",
                [
                    {
                        stock_quantity: newStock
                    },
                    {
                        item_id: parseInt(data.choice)
                    }
                ],
                function(err){
                    if(err) throw err;
                    console.log("You've successfully added " + data.amount + " inventory to " + res[parseInt(data.choice) - 1].product_name + ". \n");
                    runapp();
                    }   
                );
          
          
     
        });
    });
};

function addNewProduct(){



    inquirer
    .prompt(
        [
            {
                type: "input",
                name: "productName",
                message: "What is the name of the product?",
                validate: function(input){
                    this.async();
                    var done = this.async();
                        inquirer.prompt(
                            [
                                {
                                    type: "confirm",
                                    name: "confirmation",
                                    message: "\n Is the name " + input + " okay?"
                                }
                            ]

                        )
                        .then(function(data)
                        {
                            if(data.confirmation){
                                return done();
                            }else done(null,false);
                        })
                  
                }
            },
            {
                
            }
        ]
    )
    .then(function(data){

    })

}