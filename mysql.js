const mysql = require('mysql')
var pool = mysql.createPool({
    connectionLimit: process.env.DBLIMIT,
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    database: process.env.DATABASE,
    multipleStatements: true
});

module.exports = {
    escape: mysql.escape,
    query: function() {

        var query, data, callback
        if (arguments.length == 3) {
            query = arguments[0]
            data = arguments[1]
            callback = arguments[2]
        } else if (arguments.length == 2) {
            query = arguments[0]
            callback = arguments[1]
        }
        pool.getConnection(function(err, connection) {
            if (err) throw err; // not connected!

            if (data)
                connection.query(query, data, function(error, results, fields) {
                    callback(error, results)
                        // When done with the connection, release it.
                    connection.release();
                });
            else
                connection.query(query, function(error, results, fields) {
                    callback(error, results)
                        // When done with the connection, release it.
                    connection.release();
                });
        });
    }
}