var request = require("request");
var mongojs = require("mongojs");
var cheerio = require("cheerio");
var express = require("express");

var app = express();

var databaseUrl = "scraper";
var collections = ["scrapedData"];

var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

// Main route (simple Hello World Message)
app.get("/", function(req, res) {
  res.send("Hello world");
});
var result = [];
// Retrieve data from the db
app.get("/all", function(req, res) {
  // Find all results from the scrapedData collection in the db
  // db.scrapedData.find({}, function(error, found) {
  //   // Throw any errors to the console
  //   if (error) {
  //     console.log(error);
  //   }
  //   // If there are no errors, send the data to the browser as a json
  //   else {
  //     res.json(found);
  //   }
  // });
  res.json(result);
});

// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function(req, res) {
  // Make a request for the news section of
  request("http://www.arirang.com/News/News_List.asp?category=5", function(error, response, html) {
    // Load the html body from request into cheerio
    var $ = cheerio.load(html);
    // For each element with a "" class
    $("#aNews_List li > a").each(function(i, element) {
        var title = $(element).children("h4").text();
        var link = "http://www.arirang.com/News/" + $(element).attr("href");

          result.push({
            title: title,
            link: link
        });
        
    
         // Save the data in the scrapedData db
        db.scraper.insert({
          title: title,
          link: link
        },
        function(error, data) {
          // If there's an error during this query
          if (error) {
            // Log the error
            console.log(error);
          }
          // Otherwise,
          else {
            // Log the saved data
            console.log(data);
          }
          });
        
      
    });
  });

  // This will send a "Scrape Complete" message to the browser
  res.send("Scrape Complete");
  //console.log(result);
});


// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});