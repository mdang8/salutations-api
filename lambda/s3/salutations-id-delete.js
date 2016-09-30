'use strict';
const https = require('https');
const AWS = require('aws-sdk');
const s3obj = new AWS.S3();

exports.handler = (event, context) => {

    // S3 bucket name
    const bucket = "salutations-data.api.mass.gov";

    var objDelRecord;

    let key;

    // initializes the program by calling the getData function with the updateRecord function as the callback
    getData("active");

    /**
     * Gets the active JSON data object from the S3 bucket.
     *
     * @param type         the type of JSON data to get ('active' or 'disabled')
     *
     * @throws context.fail if there is an error with retrieving the object from the S3 bucket
     * @throws context.fail if there is an error with parsing the JSON data
     */
    function getData(type) {

        // sets the key based on the inputted type of data to retrieve
        if (type == "active") {
            key = "salutations-data.json";
        } else {
            key = "salutations-disabled-data.json";
        }

        // S3 parameters for download
        var params = {
            Bucket: bucket,
            Key: key
        };

        // gets the data object from the S3 bucket
        s3obj.getObject(params, function(err, data) {
            if (err) {
                console.log(err, err.stack);

                return context.fail("Error with getting " + type + " S3 object: " + err);
            } else {
                try {
                    var dataBody = data.Body;
                    var jsonData = JSON.parse(dataBody.toString('utf8'));

                    if (type == "active") {
                        disableRecord(jsonData);
                    } else {
                        addToDisabled(jsonData, objDelRecord);
                    }
                } catch (err) {
                    return context.fail("Error with parsing " + type + " data: " + err);
                }
            }
        });

    }  // end of getData

    /**
     * Disables the record with the specified id parameter.
     *
     * @param jsonData     the active JSON data from the S3 bucket
     *
     * @throws context.fail if the specified id is 0
     * @throws context.fail if the specified id doesn't exist in the JSON data
     */
    function disableRecord(jsonData) {
        var records = jsonData.salutationsData;

        var id = event.params.id !== undefined ? event.params.id : '';
        var idIsThere = false;

        //checks for 0 id
        if (id === "0"){
            return context.fail("Cannot delete id: 0. Please try a different id.");
        }

        // loops through each object in the JSON data
        for (var i = 0; i < records.length; i++) {

            // compares the input id with the object id
            if (records[i].id === id) {

                // assigns idIsThere check
                idIsThere = true;

                records[i].isDisabled = "true";

                // assigns deleted record
                objDelRecord = {
                  "id": records[i].id,
                  "name": records[i].name,
                  "greeting": records[i].greeting,
                  "gender": records[i].gender,
                  "message": records[i].message,
                  "isDisabled": records[i].isDisabled
                };

                // removes (deletes) object from array
                records.splice(i, 1);
            }  // end if

        }  // end for-loop

        // exits if id is not there
        if (!idIsThere) {
            return context.fail("Id not found in record set.");
        } else {
            uploadData(records, "active");
        }

    }  // end of disableRecord

    /**
     * Adds the removed record to the disabled JSON data.
     *
     * @param jsonData      the disabled JSON data from the S3 bucket
     * @param newRecord     the record to add to the disabled JSON data
     */
    function addToDisabled(jsonData, newRecord) {
        var records = jsonData.salutationsDisabledData;

        // adds the record object to the JSON data array
        records.push(newRecord);

        // calls the uploadData function to upload the modified disabled data
        uploadData(records, "disabled");

    }  // end of addToDisabled

    /**
     * Uploads the modified JSON data to the S3 bucket.
     *
     * @param jsonData      the modified JSON data to be uploaded
     * @param type          the type of data to upload ('active' or 'disabled')
     *
     * @throws context.fail if there is an error on the upload
     *
     * @returns the record that was disabled
     */
    function uploadData(jsonData, type) {
        var stringJSON = JSON.stringify(jsonData);

        let body = '';

        if (type === "active") {
            body = "{ \"salutationsData\":\n\n" + stringJSON + "\n\n}";
            key = "salutations-data.json";
        } else {
            body = "{ \"salutationsDisabledData\":\n\n" + stringJSON + "\n\n}";
            key = "salutations-disabled-data.json";
        }

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
                console.log(type + " data has been uploaded.");

                if (type === "active") {
                    getData("disabled", addToDisabled);
                } else {
                    // returns the deleted record details
                    return context.done(null, objDelRecord);
                }
            });
        } catch (err) {
            // exits lambda fucntion, returns fail
            return context.fail("Error on " + type + " upload: " + err);
        }

    }  // end of uploadData

};  // end of exports handler
