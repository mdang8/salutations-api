/*jshint esversion: 6 */
/*jslint node: true */

'use strict';

const initDatabase = require('./initDatabase');
const dataFunctions = require('./dataFunctions');
const showRecord = require('./showRecord');
const pg = require('pg');

let client;
let putParams;

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
 * Gets the modification parameters and id from the event and sets the put parameters object variable.
 *
 * @param event         the event from the exports.handler
 * @param callback      the callback function
 */
exports.setup = function setup(event, callback) {
    let id = event.params.id !== undefined ? event.params.id : '';
    let name = event.body.name !== undefined ? event.body.name : '';
    let greeting = event.body.greeting !== undefined ? event.body.greeting : '';
    let gender = event.body.gender !== undefined ? event.body.gender : '';
    let message = event.body.message !== undefined ? event.body.message : '';

    putParams = {
        "id": id,
        "name": name,
        "greeting": greeting,
        "gender": gender,
        "message": message
    };

    callback();
};

/**
 * Gets the single modified record and passes it to the callback results.
 *
 * @param context       the context from the exports.handler
 * @param callback      the callback function
 */
exports.process = function process(context, callback) {
    dataFunctions.modifySingleRecord(putParams, client, context, function (results) {
        showRecord.showRecord(putParams.id, client, context, function (results) {
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
