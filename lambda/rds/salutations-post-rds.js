/*jshint esversion: 6 */
/*jslint node: true */

'use strict';

const dataFunctions = require('./dataFunctions');
const initDatabase = require('./initDatabase');
const showRecord = require('./showRecord');
const pg = require('pg');

let client;
let recordObj;

/**
 * Connects to the database and sets the client.
 *
 * @param context       the context from the exports.handler
 * @param callback      the callback function
 */
exports.init = function init(context, callback) {
    initDatabase.connectDB(context, function (results) {
        client = results;
        callback();
    });
};

/**
 * Gets the record parameters from the event and sets the record object variable.
 *
 * @param event         the event from the exports.handler
 * @param callback      the callback function
 */
exports.setup = function setup(event, callback) {
    dataFunctions.getHighestId(client, function (results) {
        let id = results + 1;
        let name = event.body.name !== undefined ? event.body.name : '';
        let greeting = event.body.greeting !== undefined ? event.body.greeting : '';
        let gender = event.body.gender !== undefined ? event.body.gender : '';
        let message = event.body.message !== undefined ? event.body.message : '';
        let is_disabled = false;

        recordObj = {
            "id": id,
            "name": name,
            "greeting": greeting,
            "gender": gender,
            "message": message,
            "is_disabled": is_disabled
        };

        callback();
    });
};

/**
 * Creates the new record and passes it to the callback results.
 *
 * @param context       the context from the exports.handler
 * @param callback      the callback function
 */
exports.process = function process(context, callback) {
    dataFunctions.addRecord(recordObj, client, context, function (results) {
        showRecord.showRecord(recordObj.id, client, context, function (results) {
            callback(null, results);
        });
    });
};

/**
 * Ends the connection with the database client.
 *
 * @param context       the context from the exports.handler
 * @param callback      the callback function
 */
exports.takedown = function takedown(context, callback) {
    client.end(function(err) {
        if (err) {
            return context.fail("Error with ending client: " + err);
        }

        callback();
    });
};
