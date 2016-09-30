'use strict';
let https = require('https');

exports.handler = (event, context, callback) => {

    // makes a GET request to get the JSON file from the S3 bucket
    var request = https.get(
        "https://s3.amazonaws.com/salutations-data.api.mass.gov/salutations-data.json",
        function(response) {
            var body = '';

            // accepts data stream and adds to body variable
            response.on("data", function(chunk) {
                body += chunk;
            });

            // triggers when data stream is complete
            response.on("end", function() {
                try {
                    // parses body variable data into object array
                    body = JSON.parse(body).salutationsData;
                } catch (err) {
                    // returns fail
                    return context.fail(
                        "Error with parsing JSON body: " +
                        err);
                }

                // calls getData function with body variable as argument
                getData(body);
            });
        }); // end of request

    // determines what data to return
    var getData = function(data) {
        var name = event.query.name !== undefined ? event.query.name : '';
        var greeting = event.query.greeting !== undefined ? event.query.greeting :
            '';
        var gender = event.query.gender !== undefined ? event.query.gender : '';
        var message = event.query.message !== undefined ? event.query.message : '';

        // the list to be returned
        var salutationsList = [];

        var salutationsListGreeting = [];
        var salutationsListGender = [];

        // if none of the parameters are specified, return all
        if (name === '' && greeting === '' && gender === '') {
            console.log("Return all.");
            salutationsList = data;

            // exits lambda function, returns successful data
            return context.done(null, salutationsList);
        }

        // if name is specified
        if (name !== '') {
            // for each object in the JSON data
            data.forEach(function(obj) {
                // compares the input name with the object name
                if (obj.name === name) {
                    // adds the object to the list to be returned
                    salutationsList.push(obj);
                }
            });

            // if the return list has objects and the greeting is also specified
            if (salutationsList.length > 0 && greeting !== '') {
                // for each object currently in the return list
                salutationsList.forEach(function(obj) {
                    // compares the input greeting with the object greeting
                    if (obj.greeting === greeting) {
                        // adds the object to the greetings list
                        salutationsListGreeting.push(obj);
                    }
                });

                // updates the new greetings list to be the list returned
                salutationsList = salutationsListGreeting;
            }

            // if the return list has objects and the gender is also specified
            if (salutationsList.length > 0 && gender !== '') {
                // for each object currently in the return list
                salutationsList.forEach(function(obj) {
                    // compares the input gender with the object gender
                    if (obj.gender === gender) {
                        // adds the object to the gender list
                        salutationsListGender.push(obj);
                    }
                });

                // updates the new genders list to be the list returned
                salutationsList = salutationsListGender;
            }

            // if greeting is specified
        } else if (greeting !== '') {
            // for each object in the JSON data
            data.forEach(function(obj) {
                // compares the input greeting with the object greeting
                if (obj.greeting === greeting) {
                    // adds the object to the list to be returned
                    salutationsList.push(obj);
                }
            });

            // if the return list has objects and the gender is also specified
            if (salutationsList.length > 0 && gender !== '') {
                // for each object currently in the return list
                salutationsList.forEach(function(obj) {
                    // compares the input gender with the object gender
                    if (obj.gender === gender) {
                        // adds the object to the gender list
                        salutationsListGender.push(obj);
                    }
                });

                // updates the new gender list to be the list returned
                salutationsList = salutationsListGender;
            }

            // if gender is specified
        } else if (gender !== '') {
            // for each object in the JSON data
            data.forEach(function(obj) {
                // compares the input gender with the object gender
                if (obj.gender === gender) {
                    // adds the object to the list to be returned
                    salutationsList.push(obj);
                }
            });

            // if the return list has objects and the greeting is also specified
            if (salutationsList.length > 0 && greeting !== '') {
                // for each object currently in the return list
                salutationsList.forEach(function(obj) {
                    // compares the input greeting with the object greeting
                    if (obj.greeting === greeting) {
                        // adds the object to the greeting list
                        salutationsListGreeting.push(obj);
                    }
                });

                // updates the new greeting list to be the list returned
                salutationsList = salutationsListGreeting;
            }
        }

        // exits lambda function, returns successful data
        return context.done(null, salutationsList);
    } // end of getData

}; // end of exports handler
