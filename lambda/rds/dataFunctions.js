/*jshint esversion: 6 */
/*jslint node: true */

'use strict';

/**
 * Adds a record to the database table. This uses a SQL INSERT query to create the new row.
 *
 * @param recordObj     the object variable of the record to be added
 * @param client        the PostgreSQL database client
 * @param context       the context from the exports.handler
 * @param callback      the callback function
 */
exports.addRecord = function addRecord(recordObj, client, context, callback) {
    let id = recordObj.id;
    let name = recordObj.name;
    let greeting = recordObj.greeting;
    let gender = recordObj.gender;
    let message = recordObj.message;
    let is_disabled = recordObj.is_disabled;

    let queryStr = "INSERT INTO Salutations (id, name, greeting, gender, message, is_disabled) VALUES (" + id + ", '" + name + "', '" + greeting + "', '" + gender + "', '" + message + "', " + is_disabled + ")";
    console.log("Query string: " + queryStr);

    let query = client.query(queryStr);

    client.query(queryStr, function(err) {
        if (err) {
            if (!err.toString().includes("error: duplicate key value violates unique constraint")) {
                client.end();
                return context.fail("Error with insert query: " + err);
            }
        }

        callback();
    });
};

/**
 * Deletes a record from the database table. This uses a SQL DELETE query to remove the row.
 *
 * @param id            the id of the record to delete
 * @param client        the PostgreSQL database client
 * @param context       the context from the exports.handler
 * @param callback      the callback function
 */
exports.deleteRecord = function deleteRecord(id, client, context, callback) {
    let queryStr = "DELETE FROM Salutations WHERE id = " + id;

    console.log("Query String is: " + queryStr);

    client.query(queryStr, function (err) {
        if (err) {
            return context.fail("Error with the delete query: " + err);
        }

        callback();
    });
};

/**
 * Modifies all the records in the database table. This uses a SQL UPDATE query to modify the rows.
 *
 * @param putParams     the object with all the modification parameters
 * @param client        the PostgreSQL database client
 * @param context       the context from the exports.handler
 * @param callback      the callback function
 */
exports.modifyAllRecords = function modifyAllRecords(putParams, client, context, callback) {
    let name = putParams.name;
    let greeting = putParams.greeting;
    let gender = putParams.gender;
    let message = putParams.message;

    let queryStr = '';

    if (name === '' && greeting === '' && gender === '' && message === '') {
        callback();
    } else {
        queryStr = "UPDATE Salutations SET ";

        if (name !== '') {
            queryStr = queryStr + "name = '" + name + "', ";
        }

        if (greeting !== '') {
            queryStr = queryStr + "greeting = '" + greeting + "', ";
        }

        if (gender !== '') {
            queryStr = queryStr + "gender = '" + gender + "', ";
        }

        if (message !== '') {
            queryStr = queryStr + "message = '" + message + "', ";
        }

        // removes the ", " at the end of the query string
        queryStr = queryStr.substring(0, queryStr.length - 2);
    }

    console.log("Query String is: " + queryStr);

    client.query(queryStr, function(err) {
        if (err) {
            return context.fail("Error with update query: " + err);
        }

        callback();
    });
};

/**
 * Modifies a single record in the database table. This uses a SQL UPDATE query to modify the row.
 *
 * @param putParams     the object with the modification parameters
 * @param client        the PostgreSQL database client
 * @param context       the context from the exports.handler
 * @param callback      the callback function
 */
exports.modifySingleRecord = function modifySingleRecord(putParams, client, context, callback) {
    let id = putParams.id;
    let name = putParams.name;
    let greeting = putParams.greeting;
    let gender = putParams.gender;
    let message = putParams.message;

    let queryStr = '';

    if (name === '' && greeting === '' && gender === '' && message === '') {
        callback();
    } else {
        queryStr = "UPDATE Salutations SET ";

        if (name !== '') {
            queryStr = queryStr + "name = '" + name + "', ";
        }

        if (greeting !== '') {
            queryStr = queryStr + "greeting = '" + greeting + "', ";
        }

        if (gender !== '') {
            queryStr = queryStr + "gender = '" + gender + "', ";
        }

        if (message !== '') {
            queryStr = queryStr + "message = '" + message + "', ";
        }

        // removes the ", " at the end of the query string
        queryStr = queryStr.substring(0, queryStr.length - 2);
    }

    queryStr = queryStr + " WHERE id = " + String(id);

    console.log("Query String is: " + queryStr);

    client.query(queryStr, function(err) {
        if (err) {
            return context.fail("Error with update query: " + err);
        }

        callback();
    });
};

/**
 * Gets the current highest index in the database table. This uses a SQL SELECT query to retrieve
 * all the rows and then limits the return to the top 1 descending value.
 *
 * @param client        the PostgreSQL database client
 * @param callback      the callback function
 */
exports.getHighestId = function getHighestId(client, callback) {
    let queryStr = "SELECT * FROM Salutations ORDER BY id DESC LIMIT 1";
    let data;

    let query = client.query(queryStr);

    query.on('row', function(row) {
        data = row;
    });

    query.on('end', function() {
        callback(data.id);
    });
};
