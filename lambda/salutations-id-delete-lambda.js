'use strict';
let https = require('https');
var AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';
var fs = require('fs');

exports.handler = (event, context, callback) => {
    var request = https.get("https://s3-us-west-2.amazonaws.com/salutations-bucket/salutations-data.json",
        function(response) {
            var body = '';

            response.on("data", function(chunk) {
                body += chunk;
            });

            response.on("end", function() {
                try {
                    body = JSON.parse(body);
                } catch(err) {
                    console.error("Error with parsing JSON body.");
                    return;
                }

                deleteRecord(body);
            });
        });

    var deleteRecord = function(data) {
        var id = 0;

        data['salutationsData'].forEach(function(obj) {
            if (obj.id == id) {
                var index = data['salutationsData'].indexOf(obj);
                data['salutationsData'].splice(index, 1);
            }
        });

        writeData(JSON.stringify(data));
    }

    var writeData = function(data) {
        fs.writeFile("/tmp/salutations-data.json", data, function(err) {
            if(err)
                context.fail("writeFile failed: " + err);
            else
                console.log("writeFile succeeded");
        });

        uploadData(data);
    }

    var uploadData = function(data) {
        var body = fs.readFile("/tmp/salutations-data.json");
        var s3obj = new AWS.S3({
            params: {
                Bucket: "salutations-bucket",
                Key: "salutations-data.json"
            }
        });

        try {
            s3obj.upload({Body: data}).on('httpUploadProgress', function(evt) {
                console.log(evt);
            }).send(function(err, data) {
                console.log(err, data)
            });
        } catch (err) {
            context.fail("Error on upload.");
        }

        context.done(null, "Successfully deleted record.");
    }
};
