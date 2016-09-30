'use strict';

const https = require('https');
const AWS = require('aws-sdk');
AWS.config.region = 'us-east-1';
const s3obj = new AWS.S3();

exports.handler = (event, context) => {

    const bucket = "salutations-data.api.mass.gov";
    const key = "salutations-data.json";

    // initializes the program by calling the getData function with the updateRecord function as the callback
    getData(updateRecord);

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

        // downloads the data object from the S3 bucket
        s3obj.getObject(params, function(err, data) {
            if (err) {
                console.log(err, err.stack);

                // returns a fail if there is an error with downloading the S3 object
                return context.fail("Error with getting S3 object: " + err);
            } else {
                let dataBody;
                let jsonData;

                // try-catch for parsing the JSON
                try {
                    dataBody = data.Body;
                    jsonData = JSON.parse(dataBody.toString('utf8'));
                } catch (err) {
                    // returns a fail if there is an error with parsing the JSON
                    return context.fail("Error with parsing data: " + err);
                }

                // makes a call to the callback function once the data has been downloaded and parsed
                callback(jsonData);
            }
        });

    }  // end of getData

    /**
     * Updates the record in the JSON data with the specified id.
     *
     * @param jsonData      the active JSON data from the S3 bucket
     *
     * @throws context.fail if the specified id isn't found in the record set
     */
    function updateRecord(jsonData) {
        var records = jsonData.salutationsData;

        // gets the parameters from the event
        var id = event.params.id !== undefined ? event.params.id : '';
        var name = event.body.name !== undefined ? event.body.name : '';
        var greeting = event.body.greeting !== undefined ? event.body.greeting : '';
        var gender = event.body.gender !== undefined ? event.body.gender : '';
        var message = event.body.message !== undefined ? event.body.message : '';

        // sets each parameter to be updated
        var parameters = {
            "name": name,
            "greeting": greeting,
            "gender": gender,
            "message": message
        };

        var idExists = false;

        // loops through each element in the JSON data array
        for (var i = 0; i < records.length; i++) {

            // compares the record id with the input id
            if (records[i].id === id) {

                // sets the flag to true to indicate that the id has been found
                idExists = true;

                // for each parameter name-key
                for (var p in parameters) {

                    // if the parameter value is not ''
                    if (parameters.hasOwnProperty(p) && parameters[p] !== '') {

                        // checks that the record has the parameter and it is not undefined
                        if (records[i].hasOwnProperty(p) && records[i][p] !== undefined) {

                            // updates the parameter of the record
                            records[i][p] = parameters[p];
                        }  // end if

                    }  // end if

                }  // end for-loop iterating through the parameter names

                uploadData(records);

            }  // end if

        }  // end for-loop iterating through each element in the JSON data array

        // if the id was not found
        if (!idExists) {
            return context.fail("The specified id does not exist in the data.");
        }

    }  // end of updateRecord

    /**
     * Uploads the modified JSON data to the S3 bucket.
     *
     * @param jsonData      the modified JSON data to be uploaded
     *
     * @throws context.fail if there is an error on the upload
     */
    function uploadData(jsonData) {
        // converts the JSON to a string
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

                // calls the getData function with the showUpdates function as the callback
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
     * @return the modified data
     */
    function showUpdates(jsonData) {
        var records = jsonData.salutationsData;

        var id = event.params.id !== undefined ? event.params.id : '';

        // the record object that was updated
        var toShow;

        // iterate through each record in the JSON data
        for (var i = 0; i < records.length; i++) {

            // compares the record id to the input id
            if (records[i].id === id) {

                // sets the record object to return to the user
                toShow = records[i];

                // breaks out of the for-loop because the record has been found
                break;
            }  // end if

        }  // end for-loop

        // returns the updated record
        return context.done(null, toShow);

    }  // end of showUpdates

};  // end of exports handler
