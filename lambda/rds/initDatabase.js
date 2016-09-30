/*jshint esversion: 6 */
/*jslint node: true */

'use strict';

const rdsConfig = require('./rds_config.js');
const pg = require('pg');

exports.connectDB = function connectDB(context, callback) {
    let host = rdsConfig.rds_host;
    let name = rdsConfig.rds_username;
    let password = rdsConfig.rds_password;
    let dbName = rdsConfig.rds_db_name;
    let port = rdsConfig.rds_port;

    let connectStr = "postgres://" + name + ":" + password + "@" + host + ":" + port + "/" + dbName;

    let client = new pg.Client(connectStr);

    client.connect(function(err) {
        if (err) {
            return context.fail("Error with connecting client: " + err);
        }

        callback(client);
    });
};
