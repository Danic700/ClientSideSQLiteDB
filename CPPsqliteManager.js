/*  
This Sqlite manager is comprised of the following:

connectDB() - Opens a connection to the Sqlite DB assuming the browser supports it
initDB() - If there are no tables present initDB will create the following tables :CPP,SEARCH and CLICK
cleanDB() - It will drop all the tables specified by giving the dropTable() function the name of the table you wish to remove

UpdateCPP() - These 3 functions create a table and insert data into it, for this purpose there is a data JSON in each one of these functions to initialize each table with a dummy value
UpdateSearch() - Data can also be transferred  with AJAX requests as you see fit, there is an example of this in the demo version
UpdateClick()

There is a general getTable function which in turn uses one of the createObject functions and retrieves all the information from the table, an example of this is in the demo




*/ 

var database;
var EXPIRE_TIME = 1000 * 10; 

function connectDB() {
    try {
        if (!window.openDatabase) {
            alert('not supported');
        }
        else {
            // setting for our database
            var shortName = 'CPP_DB';
            var version = '1.0';
            var displayName = 'CPP DB';
            var maxSize = 65536; // in bytes

            database = openDatabase(shortName, version, displayName, maxSize);
        }
    } catch (e) {
        // Error handling code goes here.
        if (e == 2) {
            // Version number mismatch.
            alert("Invalid database version.");
        } else {
            alert("Unknown error " + e + ".");
        }
    }
}
;

function myTransactionErrorCallback(error) {
    console.log('Oops.  Error was ' + error.message + ' (Code ' + error.code + ')');
    return true;
}

function myTransactionSuccessCallback() {
    console.log("transaction successful");
}

// Create table
var CPPTable = {
    NAME: "CPP",
    COL_ID: "id",
    COL_PRODUCT_NAME: "name",
    COL_TIME_SEARCHED: "time",
    COL_PRICE: "price",
    COL_IMG_URL: "imgUrl"
};


var searchTable = {
    NAME: "Search",
    COL_ID: "id",
    COL_SEARCH_PARAMETERS: "name",
    COL_TIME_SEARCHED: "time"
};

var clickTable = {
    NAME: "Click",
    COL_ID: "id",
    COL_PRODUCT_NAME: "name",
    COL_TIME_CLICKED: "time"
};

var settingsTable = {
    NAME: "Settings",
    COL_ID: "settingId",
    COL_LAST_UPDATE_DATE: "lastUpdate"
};

function initDB() {
    console.log("initDB > started");

    database.transaction(
            function (tx) {

                //tx.executeSql("DROP TABLE " + settingsTable.NAME + ";");

                var createSettingsTableQuery = "CREATE TABLE IF NOT EXISTS " + settingsTable.NAME + " ("
                        + settingsTable.COL_ID + " INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "
                        + settingsTable.COL_LAST_UPDATE_DATE + " INTEGER NOT NULL);";
                tx.executeSql(createSettingsTableQuery);

                var query = "SELECT * FROM " + settingsTable.NAME + " WHERE " + settingsTable.COL_ID + " = 1;";
                tx.executeSql(query, [],
                        function (tx, results) {
                            if (results.rows.length === 0 || results.rows.item(0)[settingsTable.COL_LAST_UPDATE_DATE] + EXPIRE_TIME <= Date.now()) {
                                console.log("initDB > updateing DB.");

                              
                                UpdateCPP();
                                UpdateSearch();
                                UpdateClick();
                                
                                var updateSettingsTimeQuery = "INSERT OR REPLACE INTO " + settingsTable.NAME + " ("
                                        + settingsTable.COL_ID + ", "
                                        + settingsTable.COL_LAST_UPDATE_DATE + ") VALUES (1, " + Date.now() + ");";

                                tx.executeSql(updateSettingsTimeQuery);

                            } else {
                                console.log("initDB > db is up to date.");
                            }
                        });
            }, myTransactionErrorCallback, function () {
        console.log("initDB > complete");
    });
}

function UpdateCPP(){
 console.log("updateCPP > started");
 
 var data =[{'productName':'Dummy product name','img':'dummy url','id':'1','timeSearched':moment().format("DD/MM/YYYY HH:mm"),'price':'dummy price'}, {'productName':'dummy product name','img':'dummy url','id':'2','timeSearched':moment().format("DD/MM/YYYY HH:mm"),'price':'dummy price'}];
    //alert(JSON.stringify(data.id));
 database.transaction(
                    function (tx) {

                        // Create table if don't exist
                        var createCPPTableQuery = "CREATE TABLE IF NOT EXISTS " + CPPTable.NAME + " ("
                                + CPPTable.COL_ID + " INTEGER NOT NULL PRIMARY KEY, "
                                + CPPTable.COL_PRODUCT_NAME + " TEXT, "
                                + CPPTable.COL_PRICE + " TEXT, "
                                + CPPTable.COL_TIME_SEARCHED + " TEXT, "
                                + CPPTable.COL_IMG_URL + " TEXT NOT NULL);";

                        tx.executeSql(createCPPTableQuery);

                        // Clear table
                        emptyTable(tx, CPPTable.NAME);

                        // Build bulk insert query
                        if (0 < data.length) {
                            var insertCPPQuery = "INSERT INTO " + CPPTable.NAME + " "
                                    + "SELECT "
                                    + data[0].id + " AS " + CPPTable.COL_ID + ", "
                                    + "'" + data[0].productName + "'" + " AS " + CPPTable.COL_PRODUCT_NAME + ", "
                                    + "'" + data[0].price + "'" + " AS " + CPPTable.COL_PRICE + ", "
                                    + "'" + data[0].timeSearched + "'" + " AS " + CPPTable.COL_TIME_SEARCHED + ", "
                                    + "'" + data[0].img + "'" + " AS " + CPPTable.COL_IMG_URL;

                            for (var i = 1; i < data.length; i++) {
                                insertCPPQuery += " UNION SELECT "
                                        + data[i].id + ", "
                                        + "'" + data[i].productName + "'" + ", "
                                        + "'" + data[i].price + "'" + ", "
                                        + "'" + data[i].timeSearched + "'" + ", "
                                        + "'" + data[i].img + "'";
                            }
                            insertCPPQuery += ";";

                            // Execute bulk insert query
                        
                            tx.executeSql(insertCPPQuery);
                        }

                    }, myTransactionErrorCallback, function () {
                console.log("updateCPPs > complete");
        
            });
 
}



function UpdateSearch(){
 console.log("updateSEARCH >  started");
 
  var data =[{'searchParameters':'ball','id':'1','timeSearched':moment().format("DD/MM/YYYY HH:mm")}, {'searchParameters':'Tennis ball','id':'2','timeSearched':moment().format("DD/MM/YYYY HH:mm")}];
    //alert(JSON.stringify(data.id));
 database.transaction(
                    function (tx) {

                        // Create table if don't exist
                        var createSearchTableQuery = "CREATE TABLE IF NOT EXISTS " + searchTable.NAME + " ("
                                + searchTable.COL_ID + " INTEGER NOT NULL PRIMARY KEY, "
                                + searchTable.COL_SEARCH_PARAMETERS + " TEXT, "
                                + searchTable.COL_TIME_SEARCHED + " TEXT NOT NULL);";

                        tx.executeSql(createSearchTableQuery);

                        // Clear table
                        emptyTable(tx, searchTable.NAME);

                        // Build bulk insert query
                        if (0 < data.length) {
                            var insertSearchQuery = "INSERT INTO " + searchTable.NAME + " "
                                    + "SELECT "
                                    + data[0].id + " AS " + searchTable.COL_ID + ", "
                                    + "'" + data[0].searchParameters + "'" + " AS " + searchTable.COL_SEARCH_PARAMETERS + ", "
                                    + "'" + data[0].timeSearched + "'" + " AS " + searchTable.COL_TIME_SEARCHED;

                            for (var i = 1; i < data.length; i++) {
                                insertSearchQuery += " UNION SELECT "
                                        + data[i].id + ", "
                                        + "'" + data[i].searchParameters + "'" + ", "
                                        + "'" + data[i].timeSearched + "'";
                            }
                            insertSearchQuery += ";";

                            // Execute bulk insert query
                        
                            tx.executeSql(insertSearchQuery);
                        }

                    }, myTransactionErrorCallback, function () {
                console.log("UpdateSearch > complete");
        
            });
 
}



function UpdateClick(){
 console.log("updateCLICK >  started");
 
  var data =[{'productName':'ball','id':'1','timeClicked':moment().format("DD/MM/YYYY HH:mm")}, {'productName':'Tennis ball','id':'2','timeClicked':moment().format("DD/MM/YYYY HH:mm")}];
    //alert(JSON.stringify(data.id));
 database.transaction(
                    function (tx) {

                        // Create table if don't exist
                        var createClickTableQuery = "CREATE TABLE IF NOT EXISTS " + clickTable.NAME + " ("
                                + clickTable.COL_ID + " INTEGER NOT NULL PRIMARY KEY, "
                                + clickTable.COL_PRODUCT_NAME + " TEXT, "
                                + clickTable.COL_TIME_CLICKED + " TEXT NOT NULL);";

                        tx.executeSql(createClickTableQuery);

                        // Clear table
                        emptyTable(tx, clickTable.NAME);

                        // Build bulk insert query
                        if (0 < data.length) {
                            var insertClickQuery = "INSERT INTO " + clickTable.NAME + " "
                                    + "SELECT "
                                    + data[0].id + " AS " + clickTable.COL_ID + ", "
                                    + "'" + data[0].productName + "'" + " AS " + clickTable.COL_PRODUCT_NAME + ", "
                                    + "'" + data[0].timeClicked + "'" + " AS " + clickTable.COL_TIME_CLICKED;

                            for (var i = 1; i < data.length; i++) {
                                insertClickQuery += " UNION SELECT "
                                        + data[i].id + ", "
                                        + "'" + data[i].productName + "'" + ", "
                                        + "'" + data[i].timeClicked + "'";
                            }
                            insertClickQuery += ";";

                            // Execute bulk insert query
                        
                            tx.executeSql(insertClickQuery);
                        }

                    }, myTransactionErrorCallback, function () {
                console.log("UpdateClick > complete");
        
            });
 
}




// Get Table Action
var getCPP = function (callback) {
    getTable(CPPTable.NAME, createCPPObject, callback);
};

var getSearch = function (callback) {
    getTable(searchTable.NAME, createSearchObject, callback);
};

var getClick = function (callback) {
    getTable(clickTable.NAME, createClickObject, callback);
};



var getTable = function (tableName, createObjFunc, callback) {
    database.transaction(
            function (transaction) {
                transaction.executeSql(
                        "SELECT * FROM " + tableName + ";",
                        [],
                        function (transaction, results) {
                            var data = [];

                            for (var i = 0; i < results.rows.length; i++) {
                                data.push(createObjFunc(results.rows.item(i)));
                            }

                            callback(data);
                        }
                );
            }
    );
};

function emptyTable(tx, tableName) {
    var emptyTableQuery = "DELETE FROM " + tableName + ";";
    tx.executeSql(emptyTableQuery);
}

function cleanDB() {
    dropTable(CPPTable.NAME);
    dropTable(searchTable.NAME);
    dropTable(clickTable.NAME);
    dropTable(settingsTable.NAME);
}

function dropTable(tableName) {
    database.transaction(
            function (transaction) {
                transaction.executeSql("DROP TABLE " + tableName + ";");
            }, myTransactionErrorCallback, function () {
        console.log("table " + tableName + " deleted");
    });
}

function createCPPObject(row) {
    var CPP = {};

    CPP.id = row[CPPTable.COL_ID];
    CPP.productName = row[CPPTable.COL_PRODUCT_NAME];
    CPP.timeSearched = row[CPPTable.COL_TIME_SEARCHED];
    CPP.img = row[CPPTable.COL_IMG_URL];
    CPP.price = row[CPPTable.COL_PRICE];

    return CPP;
}


function createSearchObject(row) {
    var search = {};

    search.id = row[searchTable.COL_ID];
    search.searchParameters = row[searchTable.COL_SEARCH_PARAMETERS];
    search.timeSearched = row[searchTable.COL_TIME_SEARCHED];
   
    return search;
}

function createClickObject(row) {
    var click = {};

    click.id = row[clickTable.COL_ID];
    click.productName = row[clickTable.COL_PRODUCT_NAME];
    click.timeClicked = row[clickTable.COL_TIME_CLICKED];
   
    return click;
}



function convertBooleanToNumber(boolean) {
    return boolean == true ? 1 : 0;
}
function convertNumberToBoolean(number) {
    return number == 0 ? false : true;
}



connectDB();
//cleanDB();
initDB();


getSearch(function (search) {
    console.log(JSON.stringify(search));
});

getCPP(function (CPP) {
    console.log(JSON.stringify(CPP));
});

getClick(function (click) {
    console.log(JSON.stringify(click));
});





//Send table data to desired URL
function sendData() {
    $.ajax({
            type: "POST",
            url: '  ', 
            data: ' ',
            contentType: "application/json",
            dataType: "text",
              
            success:function(result)
            {
               
            
            }
            ,
            failure:function(err)
            {
                
            }
        

        });

}


