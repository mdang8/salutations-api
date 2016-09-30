'use strict';
const https = require('https');

exports.handler = (event, context) => {

    // makes a GET request to get the JSON file from the S3 bucket
    var request = https.get('https://s3.amazonaws.com/salutations-data.api.mass.gov/salutations-data.json',
        function(response) {
            var body = '';

            // accepts data stream and adds to body variable
            response.on('data', function(chunk) {
                body += chunk;
            });

            // triggers when data stream is complete
            response.on('end', function() {
                // parses body variable data into object array
                body = JSON.parse(body);

                // calls getData function with body variable as argument
                getData(body);
            });
        });  // end of request

    // searches through data to find object with the same input id
    var getData = function(data) {
        var id = event.params.id !== undefined ? event.params.id : '';

        var salutation = '';

        // loops through each object in the JSON data to compare the id with the input id
        data.salutationsData.forEach(function(obj) {

            // compares input id with object id
            if (obj.id === id) {
                salutation = obj;

                // exits lambda function, returns successful results
                context.done(null, salutation);
            }  // end of if statement

        });  // end of foreach loop

        // exits lambda fucntion, returns fail
        context.fail("Id does not exist.");

    };  // end of getData

};  // end of exports handler
