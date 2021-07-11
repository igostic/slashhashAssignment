var path = require("path");
var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var router = express.Router();
var multer = require("multer");
var upload = multer({
  dest: "uploaded/",
});
var fs = require("fs");
var Q = require("q");

app.use("/", router);
app.set("view engine", "ejs");
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/uploaded", express.static(path.join(__dirname, "uploaded")));

router.get("/", function (req, res, next) {
  res.render("index");
});

router.post("/imageUpload", function (req, res, next) {
  upload(req, res).then(
    function (file) {
      res.json(file);
    },
    function (err) {
      res.send(500, err);
    }
  );
});

var upload = function (req, res) {
  var deferred = Q.defer();
  var storage = multer.diskStorage({
    // folder to save to server
    destination: function (req, file, cb) {
      cb(null, "uploaded/");
    },

    //Name of the file to be saved on the server
    filename: function (req, file, cb) {
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth() + 1; //January is 0!
      var yyyy = today.getFullYear();
      var hour = today.getHours();
      var minute = today.getMinutes();
      var seconds = today.getSeconds();
      if (dd < 10) {
        dd = "0" + dd;
      }
      if (mm < 10) {
        mm = "0" + mm;
      }
      today =
        yyyy + "_" + mm + "_" + dd + "_" + hour + "" + minute + "" + seconds;

      file.uploadedFile = {
        name: today,
        ext: file.mimetype.split("/")[1],
      };
      cb(null, file.uploadedFile.name + "." + file.uploadedFile.ext);
    },
  });
  var upload = multer({ storage: storage }).single("file");
  upload(req, res, function (err) {
    if (err) deferred.reject();
    else deferred.resolve(req.file.uploadedFile);
  });
  return deferred.promise;
};

app.listen("2080", function () {
  console.log("Server is running at 2080 port!");
});
