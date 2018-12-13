const util = require("util");
const express = require("express");
const initializeDatabase = require("./database");
const bodyParser = require("body-parser");
const cors = require("cors");
jwt = require("jsonwebtoken");
config = require("./configurations/config");
morgan = require("morgan");
const ProtectedRoutes = express.Router();
//const expressWs = require("express-ws");
const app = express();
const server = require("http").createServer(app);
var ews = require("express-ws")(app, server);
//const http = require("http");
const { Client } = require("tplink-smarthome-api");

// parse application/json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//set secret
app.set("Secret", config.secret);
// use morgan to log requests to the console
app.use(morgan("dev"));

app.use(cors());

//server = http.createServer(app);
initializeDatabase(app);
server.listen(80, () => {
  console.log(`Listening on port 8080`);
});
//app.listen(80);

app.use("/api", ProtectedRoutes);

app.get("/", function(req, res) {
  res.send("Hello world  app is running on http://localhost:8080/");
});

app.post("/authenticate", (req, res) => {
  if (req.body.username === "roberto") {
    if (req.body.password === "123") {
      //if eveything is okey let's create our token

      const payload = {
        check: true
      };

      var token = jwt.sign(payload, app.get("Secret"), {
        expiresIn: 1440 // expires in 24 hours
      });

      res.json({
        message: "authentication done ",
        token: token
      });
    } else {
      res.json({ message: "please check your password !" });
    }
  } else {
    res.json({ message: "user not found !" });
  }
});

ProtectedRoutes.use((req, res, next) => {
  // check header for the token
  console.log("roberto");
  console.log(req);
  console.log(res);
  var token = req.headers["access-token"];

  // decode token
  if (token) {
    // verifies secret and checks if the token is expired
    jwt.verify(token, app.get("Secret"), (err, decoded) => {
      if (err) {
        return res.json({ message: "invalid token" });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });
  } else {
    // if there is no token
    res.send({
      message: "No token provided."
    });
  }
});

ProtectedRoutes.get("/getAllDevices", (req, res) => {
  let devices = [
    {
      id: 1,
      name: "tp link 100"
    },
    {
      id: 2,
      name: "tp link 200"
    }
  ];

  res.json(devices);
});

app.post("/turnOn", (req, res) => {
  console.log(req.body[0].ip);
  client
    .getDevice({ host: req.body[0].ip })
    .then(device => {
      device
        .setPowerState(true)
        .then(result => {
          console.log(result);
          res.json(JSON.stringify({ status: result }));
        })
        .catch(error => {
          console.log(error);
          res.json(error);
        });
    })
    .catch(error => {
      console.log(error);
      res.json(JSON.stringify(error));
    });
});

app.post("/turnOff", (req, res) => {
  client
    .getDevice({ host: req.body[0].ip })
    .then(device => {
      device
        .setPowerState(false)
        .then(result => {
          console.log(result);
          res.json(JSON.stringify({ status: result }));
        })
        .catch(error => {
          console.log(error);
          res.json(error);
        });
    })
    .catch(error => {
      console.log(error);
      res.json(JSON.stringify(error));
    });
});

const client = new Client();
var aWss = ews.getWss("isOn");

app.ws("/isOn", function(ws, req) {
  ws.on("message", function(msg) {
    //conectamos el device utilizamos el host
    ws.send("connected");
  });
});

var statusEvent = function(eventName, deviceInformation, state) {
  let device = {
    alias: deviceInformation._sysInfo.alias,
    deviceId: deviceInformation._sysInfo.deviceId,
    status: state
  };
  console.log(device);
  aWss.clients.forEach(function(client) {
    client.send(JSON.stringify(device));
  });
};

client.on("device-new", device => {
  device.startPolling(5000);
  console.log(device._sysInfo.alias);
  // Plug Events
  device.on("power-update", powerOn => {
    statusEvent("power-update", device, powerOn);
  });
});

console.log("Starting Device Discovery");
client.startDiscovery();
