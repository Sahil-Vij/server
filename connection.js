var mysql = require("mysql");
var config = require("./util/config");
const error = require("./util/error");

var connection = mysql.createPool(config.server_config);

async function getConnection(sql, res, result_list) {
  console.log(sql);
  return new Promise((resolve, reject) => {
    connection.getConnection(async function (err, tempCon) {
      if (err) {
        tempCon.release();
        error(res, 500, "Internal server error", err);
      } else {
        if (result_list !== undefined) {
          await tempCon.query(sql, [result_list], function (err, result) {
            try {
              var result1 = result;
              if (err) {
                tempCon.release();
                error(res, 500, "Internal server error", err);
              } else {
                tempCon.commit(function (err) {
                  if (err) {
                    tempCon.rollback(function () {
                      tempCon.release();
                      return error(res, 500, "Internal server error", err);
                    });
                  } else {
                    tempCon.release();
                    resolve(result1);
                  }
                });
              }
            } catch (ex) {
              error(res, 500, "Internal server error", err);
            }
          });
        } else {
          await tempCon.query(sql, function (err, result) {
            try {
              var result1 = result;
              if (err) {
                tempCon.release();
                error(res, 500, "Internal server error", err);
              } else {
                tempCon.commit(function (err) {
                  if (err) {
                    tempCon.rollback(function () {
                      tempCon.release();
                      return error(res, 500, "Internal server error", err);
                    });
                  } else {
                    tempCon.release();
                    resolve(result1);
                  }
                });
              }
            } catch (ex) {
              error(res, 500, "Internal server error", err);
            }
          });
        }
      }
    });
  });
}

//-
//- Establish a new connection
//-
connection.getConnection(async function (err) {
  if (err) {
    // mysqlErrorHandling(connection, err);
    console.log("\n *** Cannot establish a connection with the database. ***");
    console.log("Error: " + err);

    connection = await reconnect(connection);
  } else {
    console.log("\n *** New connection established with the database. ***");
  }
});

///-
//- Reconnection function
//-
function reconnect(connection) {
  console.log("\n New connection tentative...");

  //- Create a new one
  connection = mysql.createPool(config.server_config);

  //- Try to reconnect
  connection.getConnection(function (err) {
    if (err) {
      //- Try to connect every 2 seconds.
      setTimeout(function () {
        reconnect(connection);
      }, 2000);
    } else {
      console.log("\n\t *** New connection established with the database. ***");
      return connection;
    }
  });
}

//-
//- Error listener
//-
connection.on("error", function (err) {
  //-
  //- The server close the connection.
  //-
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    console.log(
      "/!\\ Cannot establish a connection with the database. /!\\ (" +
        err.code +
        ")"
    );
    return reconnect(connection);
  } else if (err.code === "PROTOCOL_ENQUEUE_AFTER_QUIT") {
    console.log(
      "/!\\ Cannot establish a connection with the database. /!\\ (" +
        err.code +
        ")"
    );
    return reconnect(connection);
  } else if (err.code === "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR") {
    console.log(
      "/!\\ Cannot establish a connection with the database. /!\\ (" +
        err.code +
        ")"
    );
    return reconnect(connection);
  } else if (err.code === "PROTOCOL_ENQUEUE_HANDSHAKE_TWICE") {
    console.log(
      "/!\\ Cannot establish a connection with the database. /!\\ (" +
        err.code +
        ")"
    );
  } else {
    console.log(
      "/!\\ Cannot establish a connection with the database. /!\\ (" +
        err.code +
        ")"
    );
    return reconnect(connection);
  }
});

module.exports = { getConnection, connection, reconnect };
