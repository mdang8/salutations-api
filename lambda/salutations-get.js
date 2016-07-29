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
        var name = event.name !== undefined ? event.name : '';
        var greeting = event.greeting !== undefined ? event.greeting : '';
        var gender = event.gender !== undefined ? event.gender : '';
        
        var salutationsList = [];
        var salutationsListGreeting = [];
        var salutationsListGender = [];
        
        if (id === '' && name === '' && greeting === '' && gender === '') {
            console.log("Return all from mock.");
            salutationsList = data;
            
            return context.done(null, salutationsList);
        }
        
        if (id !== '') {
            data.forEach(function (obj) {
                if (obj.id.search(new RegExp(id, "i")) > -1) {
                    salutationsList.push(obj);
                }
            });
            
            return context.done(null, salutationsList);
        }
        
        if (name !== '') {
            data.forEach(function (obj) {
                if (obj.name.search(new RegExp(name, "i")) > -1) {
                    salutationsList.push(obj);
                }
            });
    
            if (salutationsList.length > 0 && greeting !== '') {
                salutationsList.forEach(function (obj) {
                    if (obj.greeting === greeting) {
                        salutationsListGreeting.push(obj);
                    }
                });
                
                salutationsList = salutationsListGreeting;
            }
            
            if (salutationsList.length > 0 && gender !== '') {
                salutationsList.forEach(function (obj) {
                    if (obj.gender === gender) {
                        salutationsListGender.push(obj);
                    }
                });
                
                salutationsList = salutationsListGender;
            }
            
            return context.done(null, salutationsList);
        }
        
        if (greeting !== '') {
            data.forEach(function (obj) {
                if (obj.greeting === greeting) {
                    salutationsList.push(obj);
                }
            });
            
            if (salutationsList.length > 0 && gender !== '') {
                salutationsList.forEach(function (obj) {
                    if (obj.gender === gender) {
                        salutationsList.push(obj);
                    }
                });
                
                salutationsList = salutationsListGender;
            }
            
            return context.done(null, salutationsList);
        }
        
        if (gender !== '') {
            data.forEach(function (obj) {
                if (obj.gender === gender) {
                    salutationsList.push(obj);
                }
            });
            
            if (salutationsList.length > 0 && greeting !== '') {
                salutationsList.forEach(function (obj) {
                    if (obj.greeting === greeting) {
                        salutationsList.push(obj);
                    }
                });
                
                salutationsList = salutationsListGreeting;
            }
        }
        
        return context.done(null, salutationsList);
    }
};