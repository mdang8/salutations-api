'use strict';
const https = require('https');
const AWS = require('aws-sdk');
AWS.config.region = 'us-east-1';
const s3obj = new AWS.S3();

exports.handler = (event, context) => {

    const bucket = "salutations-data.api.mass.gov";
    const key = "salutations-data.json";

    // initializes the program by calling the getData function with the addRecord function as the callback
    getData(addRecord);

    /**
     * Gets the active JSON data object from the S3 bucket.
     *
     * @param callback      the callback function to call after the object has been retrieved
     *
     * @throws context.fail if there is an error with retrieving the object from the S3 bucket
     * @throws context.fail if there is an error with parsing the JSON data
     */
    function getData(callback) {

        // S3 parameters for download
        var params = {
            Bucket: bucket,
            Key: key
        };

        // gets the data object from the S3 bucket
        s3obj.getObject(params, function(err, data) {
            if (err) {
                console.log(err, err.stack);

                return context.fail("Error with getting S3 object: " + err);
            } else {
                try {
                    var dataBody = data.Body;
                    var jsonData = JSON.parse(dataBody.toString('utf8'));

                    callback(jsonData);
                } catch (err) {
                    return context.fail("Error with parsing data: " + err);
                }
            }
        });

    }  // end of getData

    /**
     * Adds the new record to the JSON data.
     *
     * @param jsonData      the JSON data from the S3 bucket
     */
    function addRecord(jsonData) {
        var records = jsonData.salutationsData;

        // creates id for new record
        var counter = 0;

        for (var key in records) {
            if (parseInt(records[key].id) > counter) {
                counter = parseInt(records[key].id);
            }  // end if
        }  // end For
        counter = counter + 1;

        var id = counter;  // index starts at 0
        var name = event.body.name !== undefined ? event.body.name : '';
        var greeting = event.body.greeting !== undefined ? event.body.greeting : '';
        var gender = event.body.gender !== undefined ? event.body.gender : '';
        var message = event.body.message !== undefined ? event.body.message : '';
        var isDisabled = "false";

        // the new record object to add with the parameters from the event
        var newRecord = {
            "id": id.toString(),
            "name": name,
            "greeting": greeting,
            "gender": gender,
            "message": message,
            "isDisabled": isDisabled
        };

        // adds the new record to the JSON array
        records.push(newRecord);

        // calls the writeData function with a string of the JSON data as the argument
        uploadData(records);

    }  // end of addRecord

    /**
     * Uploads the modified JSON data to the S3 bucket.
     *
     * @param jsonData      the modified JSON data to be uploaded
     *
     * @throws context.fail if there is an error on the upload
     */
    function uploadData(jsonData) {
        var stringJSON = JSON.stringify(jsonData);

        var body = "{ \"salutationsData\":\n\n" + stringJSON + "\n\n}";

        // S3 parameters for upload
        var params = {
            Bucket: bucket,
            Key: key,
            Body: body
        };

        // try-catch for uploading errors
        try {
            // uploads the modified data
            s3obj.upload(params, function(err, data) {
                console.log(err, data);
                console.log("Data has been uploaded.");

                getData(showUpdates);
            });
        } catch (err) {
            // exits lambda fucntion, returns fail
            return context.fail("Error on upload: " + err);
        }

    }  // end of uploadData

    /**
     * Returns the new data to show the changes and exits the lambda function.
     *
     * @param jsonData      the modified JSON data that was retrieved from the S3 bucket
     *
     * @return the newly added record
     */
    function showUpdates(jsonData) {
        var records = jsonData.salutationsData;

        var toShow = records[records.length - 1];

        return context.done(null, toShow);

    }  // end of showUpdates

};  // end of exports handler
