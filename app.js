const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();

app.get("/api", (req, res) => {
  res.json({
    message: "Welcome to the API"
  });
});

app.post("/api/post", verifyToken, (req, res) => {
  jwt.verify(req.token, "secretKey", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      res.json({
        message: "post created...",
        authData
      });
    }
  });
});

app.post("/api/login", (req, res) => {
  //mock user
  const user = {
    id: 1,
    username: "newUser",
    email: "test@test.test"
  };

  jwt.sign({ user: user }, "secretKey",{expiresIn: '30m'}, (err, token) => {
    res.json({
      token
    });
  });
});

//format of token
//Authorization: bearer <access_token>

//verify token
function verifyToken(req, res, next) {
  //get auth header value
  const bearerHeader = req.headers["authorization"];
  //check if bearer is undefined
  if (typeof bearerHeader !== "undefined") {
    //split at the space
    const bearer = bearerHeader.split(" ");
    // get token from array
    const bearerToken = bearer[1];
    //set token
    req.token = bearerToken;
    next();
  } else {
    //forbidden
    res.sendStatus(403);
  }
}

app.listen(5000, () => console.log("Server is running"));
