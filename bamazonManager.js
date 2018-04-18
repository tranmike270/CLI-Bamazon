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
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit App"]
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
            case "Exit App":
                connection.end();
            break;
        }
    })
}

function displayItems(){

    var table = new Table({
        head: ["Item ID", "Item", "Department", "Price", "Stock", "Cost/Item", "Restock Quantity","Current Sales"]
    
    });
   
    connection.query("SELECT * FROM products", function(err,res){
        if(err) throw err;

        for(var i = 0; i < res.length; i++){
            table.push(
                [res[i].item_id,res[i].product_name, res[i].department_name, "$" + res[i].price, res[i].stock_quantity, "$" + res[i].overHeadCost_perItem, res[i].restock_quantity,"$" + res[i].product_sales]
            );
          
        };
  
        console.log(table.toString());
        runapp();
        });
 
  };

function displayLowItems(){

    var table = new Table({
        head: ["Item ID", "Item", "Department", "Price", "Stock", "Cost/Item", "Restock Quantity","Current Sales"]
    
    });
    connection.query("SELECT * FROM products WHERE stock_quantity <= 10", function(err,res){
        if(err) throw err;

        for(var i = 0; i < res.length; i++){
            table.push(
                [res[i].item_id,res[i].product_name, res[i].department_name, "$" + res[i].price, res[i].stock_quantity, "$" + res[i].overHeadCost_perItem, res[i].restock_quantity,"$" + res[i].product_sales]
            );
   
        };

        console.log(table.toString());
        runapp();
    });
};


function addStock(){
    var table = new Table({
        head: ["Item ID", "Item", "Department", "Price", "Stock", "Cost/Item", "Restock Quantity","Current Sales"]
    
    });
    connection.query("SELECT * FROM products", function(err, res){
        if(err) throw err;
    
        for(var i = 0; i < res.length; i++){
            table.push(
                [res[i].item_id,res[i].product_name, res[i].department_name, "$" + res[i].price, res[i].stock_quantity, "$" + res[i].overHeadCost_perItem, res[i].restock_quantity,"$" + res[i].product_sales]
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
            }
        ])
        .then(function(data){
            var choice = parseInt(data.choice) - 1;
            var id = parseInt(data.choice);
            var costAdd = res[choice].restock_quantity * res[choice].overHeadCost_perItem
            var department = res[choice].department_name
            inquirer.prompt([
                {
                    type: "confirm",
                    name: "confirmation",
                    message: "The restock quantity is " + res[choice].restock_quantity + ", and will add $" + costAdd + " to the " + department + " department.\n Is that ok?"
                }
            ]).then(function(data){
                if(data.confirmation){

               
                  var newStock = res[choice].stock_quantity + res[choice].restock_quantity;
              
                    
                 console.log("New Stock: " + newStock);
                 connection.query("UPDATE products SET ? WHERE ?",
                 [
                        {
                            stock_quantity: newStock
                        },
                        {
                            item_id: id
                        }
                 ],
                 function(err){
                        if(err) throw err;
                        console.log("You've successfully added " + res[choice].restock_quantity + " inventory to " + res[choice].product_name + ". \n");
                        console.log("!." + department);
                        connection.query("SELECT * FROM departments WHERE department_name = ?",
                        [department], function(err,res){
                            if(err) throw err;
                            var updatedCost = res[0].over_head_cost + costAdd;
                            connection.query("UPDATE departments SET ? WHERE ?",
                            [
                                {
                                    over_head_cost: updatedCost
                                },
                                {
                                    department_name: department
                                }
                            ], 
                            function(err){
                                if(err) throw err;
                                console.log("Updated over head cost in department!");
                                runapp();
                            });

                        })
                     
                        
                        }   
                    );
                }else runapp();
            })

          
     
        });
    });
};

function addNewProduct(){

connection.query("SELECT department_name FROM departments",
function(err,res){
    if(err) throw err;
    
    inquirer
    .prompt(
        [
            {
                type: "input",
                name: "product",
                message: "What is the name of the product?"
        
            },
            {
                type: "list",
                name: "department",
                message: "Which department does the item belong too?",
                choices: function(){
                    var departments = [];
                    for(var i = 0; i < res.length; i++){
                        departments.push(res[i].department_name);
                    };
                    return departments;
                }
            },
            {
                type: "input",
                name: "price",
                message: "How much will this product cost to customers?",
                validate: function(input){
                    if(isNaN(input)){
                        console.log("\nPlease enter a valid number.");
                        return false;
                    };
                    return true;
                }
            },
            {
                type: "input",
                name: "overHead_price",
                message: "How much is the over head cost per item?",
                validate: function(input){
                    if(isNaN(input)){
                        console.log("\nPlease enter a valid number.");
                        return false;
                    };
                    return true;
                }
            },
            {
                type: "input",
                name: "stock",
                message: "What will be the initial stock(This will also be the restock quantity)?",
                validate: function(input){
                    if(isNaN(input)){
                        console.log("\nPlease enter a valid number.");
                        return false;
                    };
                    return true;
                }
            }

        ]
    )
    .then(function(data){
        var product = data.product;
        var department = data.department;
        var price = data.price;
        var overHead_cost = data.overHead_price;
        var stock = data.stock;

        confirm();
        function confirm(){
        
            var table = new Table({
                head: ["Item", "Department", "Price", "Initial Stock/Restock Quantity", "Over Head Price/Item"]
            
            });

            table.push(
                [product, department, "$" + price, stock, "$"+overHead_cost]
            );
            console.log(table.toString());
            inquirer.prompt([
                {
                    type: "confirm",
                    name: "confirmation",
                    message: "Is everything correct?"
                },
                {
                    type: "list",
                    name: "choice",
                    message: "Which would you like to change?",
                   choices: ["Product Name", "Department", "Price", "Initial Stock/Restock Quantity", "Over Head Cost/Item"],
                    when: function(answers){
                        return(answers.confirmation === false);
                    }
                },
                {
                    type: "input",
                 name: "product",
                 message: "What is the product name?",
                    when: function(answers){
                     return (answers.choice === "Product Name");
                    }
                },
                {
                    type: "list",
                    name: "department",
                    message: "Which department does the item belong too?",
                    choices: function(){
                        var departments = [];
                        for(var i = 0; i < res.length; i++){
                            departments.push(res[i].department_name);
                        };
                        departments.push("Other");
                        return departments;
                    },
                    when: function(answers){
                        return (answers.choice === "Department");
                    }
                },
                {
                    type: "input",
                    name: "price",
                    message: "How much will this product cost to customers?",
                    validate: function(input){
                        if(isNaN(input)){
                            console.log("\nPlease enter a valid number.");
                            return false;
                        };
                        return true;
                    },
                    when: function(answers){
                        return (answers.choice === "Price")
                    }
                },
                {
                    type: "input",
                    name: "overHead_price",
                    message: "How much is the over head cost per item?",
                    validate: function(input){
                        if(isNaN(input)){
                            console.log("\nPlease enter a valid number.");
                            return false;
                        };
                        return true;
                    },
                    when: function(answers){
                        return (answers.choice === "Over Head Cost/Item")
                    }
                },
                {
                    type: "input",
                    name: "stock",
                    message: "What will be the initial stock?",
                    validate: function(input){
                        if(isNaN(input)){
                            console.log("\nPlease enter a valid number.");
                            return false;
                        };
                        return true;
                    },
                    when: function(answers){
                        return (answers.choice === "Initial Stock/Restock Quantity")
                    }
                }
            ])
            .then(function(data){
                if(data.confirmation){
                    connection.query("INSERT INTO products SET ?", 
                    {
                        product_name: product,
                        department_name: department,
                        price: parseFloat(price),
                        stock_quantity: parseInt(stock),
                        overHeadCost_perItem: parseFloat(overHead_cost),
                        restock_quantity: parseInt(stock),
                        product_sales: 0
                    },
                    function(err){
                        if(err) throw err;
                        console.log("You've added " + product + " to your store!");
                        connection.query("SELECT * FROM departments", function(err,res){
                            if(err) throw err;
                            var dep = [];
                            for(var i = 0; i < res.length; i++){
                                dep.push(res[i].department_name);
                            };
                            var amtAdded = parseFloat(overHead_cost) * parseInt(stock);
                            if(dep.includes(department)){
                                var num = dep.indexOf(department);
                                
                                var newCost = res[num].over_head_cost + amtAdded;
                                connection.query("UPDATE departments SET ? WHERE ?",
                                [
                                    {
                                        over_head_cost : newCost
                                    },
                                    {
                                        department_name: department
                                    }
                                ],
                                function(err){
                                    if(err) throw err;
                                    console.log("Updated departments cost!");
                                    runapp();
                                }
                                )
                            }else{
                                connection.query("INSERT INTO departments SET ?",
                                {
                                    department_name: department,
                                    over_head_cost: amtAdded
                                }, function(err){
                                    if(err) throw err;
                                    console.log("Added into departments!");
                                    runapp();
                                })
                            }
                        })
                        
                    }
                    );
                }else{
                    switch(data.choice){
                        case "Product Name":
                            product = data.product;
                            confirm();
                        break;
                        case "Department" :
                            department = data.department;
                            confirm();
                        break;
                        case "Price" :
                            price = data.price;
                            confirm();
                        break;
                        case "Initial Stock/Restock Quantity" :
                            stock = data.stock;
                            confirm();
                        break;
                        case "Over Head Cost/Item":
                            overHead_cost = data.overHead_price;
                            confirm();
                        break;
                    }
                }
            })
        };
    });

});

    

};


