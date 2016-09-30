/*jshint esversion: 6 */
/*jslint node: true */

'use strict';

exports.showRecord = function showRecord(id, client, context, callback) {
    let queryStr = "SELECT * FROM Salutations WHERE id = " + id;

    let data = [];

    let query = client.query(queryStr, function(err) {
        if (err) {
            client.end();
            return context.fail("Error with select query: " + err);
        }
    });

    query.on('row', function(row) {
        data.push(row);
    });

    query.on('end', function() {
        callback(data);
    });
};

exports.showAllRecords = function showAllRecords(client, context, callback) {
    let queryStr = "SELECT * FROM Salutations";

    let data = [];

    let query = client.query(queryStr, function(err) {
        if (err) {
            client.end();
            return context.fail("Error with select query: " + err);
        }
    });

    query.on('row', function(row) {
        data.push(row);
    });

    query.on('end', function() {
        callback(data);
    });
};

exports.showFilteredRecords = function showFilteredRecords(filters, client, context, callback) {
    let name = filters.name;
    let greeting = filters.greeting;
    let gender = filters.gender;
    let message = filters.message;

    let queryStr = "SELECT * FROM Salutations";

    // if no parameters are specified, return all records
    if (name === '' && greeting === '' && gender === '' && message === '') {
        // do something
    } else {
        queryStr = queryStr + " WHERE";

        if (name !== '') {
            queryStr = queryStr + " NAME = '" + name + "' AND";
        }

        if (greeting !== '') {
            queryStr = queryStr + " GREETING = '" + greeting + "' AND";
        }

        if (gender !== '') {
            queryStr = queryStr + " GENDER = '" + gender + "' AND";
        }

        if (message !== '') {
            queryStr = queryStr + " MESSAGE = '" + message + "' AND";
        }

        // removes the " AND" at the end of the query string
        queryStr = queryStr.substring(0, queryStr.length - 4);
    }

    queryStr = queryStr + " ORDER BY id ASC";

    console.log("Query String is: " + queryStr);

    let data = [];

    let query = client.query(queryStr, function(err) {
        if (err) {
            client.end();
            return context.fail("Error with select query: " + err);
        }
    });

    query.on('row', function(row) {
        data.push(row);
    });

    query.on('end', function() {
        callback(data);
    });
};
