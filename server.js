var express = require("express")
var ehb = require("express-handlebars")
var bodyParser = require("body-parser")
var mongoose = require("mongoose")
var cheerio = require("cheerio")
var request = require("request")
// var Article = require("./models/Article.js")

var db = require("./models")

var PORT = 3000

var app = express()

app.engine("handlebars", ehb({
  defaultLayout: "main"
  // partialsDir: path.join(__dirname, "/views/layouts/partials")
}));
app.set("view engine", "handlebars");

mongoose.connect("mongodb://localhost/NewsScraper")



// This is what drive handling the submission from the front-end form
app.use(bodyParser.urlencoded({extended: true}))

app.use(express.static("public"))






var results = {};

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
    // First, we grab the body of the html with request
    request("https://www.washingtonpost.com/", function(err, response, html) {

    if (err) {
      console.log(err)
    } else {

    
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(html);
    
      $("div.headline").each(function(i, element) {

        // Save an empty result object
      //  results

results.headline = $(this)
    .children("div")
    .attr("headline")
results.title = $(this)
    .children("a")
    .text();
results.link = $(this)
    .children("a")
    .attr("href");
results.blurb = $(this)
    .children("div")
    .attr("blurb")

// .catch(function(err) {
//   // If an error occurred, send it to the client
//   return res.json(err);
// });
    // In the currently selected element, look at its child elements (i.e., its a-tags),
    // then save the values for any "href" attributes that the child elements may have
    
    

    // Save these results in an object that we'll push into the results array we defined earlier
    // results.push({
    //   title: title,
    //   link: link,
    //   blurb: blurb
    // });
    db.Article.create(results)
    .then(function(dbArticle) {
      // View the added result in the console
      console.log(dbArticle);
    })
    .catch(function(err) {
      console.log("in the catch")
      // If an error occurred, send it to the client
      return res.json(err);
    });
  });



  // Log the results once you've looped through each of the elements found with cheerio
 
        // Add the text and href of every link, and save them as properties of the result object
        // result.title = $(this)
        //   .children("a")
        //   .text();
        // result.link = $(this)
        //   .children("a")
        //   .attr("href");
  
        // Create a new Article using the `result` object built from scraping
       
        }
           // Save the text of the element in a "title" variable
    // var title = customFilter.clean($(element).text());

    // In the currently selected element, look at its child elements (i.e., its a-tags),
    // then save the values for any "href" attributes that the child elements may have
    // var link = $(element).children().attr("href");

    // Save these results in an object that we'll push into the results array we defined earlier
    // results.push({
    //   title: title,
    //   link: link
    // });
//   });

  // Log the results once you've looped through each of the elements found with cheerio
  


      });

   
    
    
  
      // If we were able to successfully scrape and save an Article, send a message to the client
      res.send("Scrape Complete");
    });
//   });

app.get("/", function(req, res) {

  var hbsObject = {
    Article: res
  };

  
  res.render("index", hbsObject);
});


// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
      .then(function(dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
  
  // Route for grabbing a specific Article by id, populate it with it's note
  app.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
      // ..and populate all of the notes associated with it
      .populate("note")
      .then(function(dbArticle) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
  
  // Route for saving/updating an Article's associated Note
  app.post("/articles/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
      .then(function(dbNote) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
      })
      .then(function(dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });
  