require("dotenv").config();
const express = require("express");
const cors = require("cors");
const body_parser = require("body-parser");

const app = express();

//storage for short url
//key - url, value - number
const shorturlMap = new Map();
//key - number, value - url
const shorturlMapReverse = new Map();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(logCalls);

app.use("/public", express.static(`${process.cwd()}/public`));

//adding body parser
app.use(body_parser.urlencoded({ extended: false }));

//home url
app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.route("/api/shorturl").post(createShorturl);
//app.post("/api/shorturl", createShorturl);

app.get("/api/shorturl/:url_number", returnRedirect);

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

/*
 * Should return object {"original_url": xxx ,"short_url": xxx }
 * or error
 *
 */
function createShorturl(req, res) {
  let returnObj = {};

  if (JSON.stringify(req.body) === JSON.stringify({})) {
    returnObj.error = "Cannot parse POST data!";
    res.json(returnObj);
    return;
  }

  inputUrl = req.body.url;
  console.log(`tested url is ${inputUrl}`);
  if (inputUrl === "") {
    returnObj.error = "No URL entered!";
    res.json(returnObj);
    return;
  }

  //return if URL is not valid
  try {
    url = new URL(inputUrl);
  } catch (_) {
    returnObj.error = "invalid url";
    res.json(returnObj);
    return;
  }

  shortUrl = shorturlMap.get(inputUrl);

  if (typeof shortUrl === "undefined") {
    //new url - adding to shorturlMap
    newUrl = shorturlMap.size === 0 ? 1 : Math.max(...shorturlMap.values()) + 1;
    shorturlMap.set(inputUrl, newUrl);
    shorturlMapReverse.set(newUrl, inputUrl);
    returnObj.original_url = inputUrl;
    returnObj.short_url = newUrl;
  } else {
    //existing - return it
    returnObj.original_url = inputUrl;
    returnObj.short_url = shortUrl;
  }
  res.json(returnObj);
}

function returnRedirect(req, res) {
  returnUrl = shorturlMapReverse.get(+req.params.url_number);
  if (typeof returnUrl === "undefined") {
    res.json({
      error: `${req.params.url_number} is not registered!`,
    });
  } else {
    res.redirect(returnUrl);
  }
}

function logCalls(req, res, next) {
  console.log("%s %s - %s", req.method, req.path, req.ip);
  next();
}
