'use strict';
let https = require('https');

exports.handler = (event, context, callback) => {
    var request = https.get('https://s3-us-west-2.amazonaws.com/salutations-bucket/salutations-data.json',
        function(response) {
            var body = '';
    
            response.on('data', function(chunk) {
                body += chunk;
            });
    
            response.on('end', function() {
                body = JSON.parse(body).salutationsData;
                getData(body);
            });
        });
    
    var getData = function(data) {
        var id = event.id !== undefined ? event.id : '';
        
        var salutation = '';
        
        data.forEach(function(obj) {
            if (obj.id === id) {
                salutation = obj;
                return context.done(null, salutation);
            }
        });
    }
};