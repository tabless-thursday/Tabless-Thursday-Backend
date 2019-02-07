require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const knex = require("knex");
const bcrypt = require("bcryptjs"); // added
const jwt = require("jsonwebtoken");

const knexConfig = require("../knexfile");

const server = express();

server.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', "*");
  res.setHeader('Access-Control-Allow-Methods', "POST,GET,OPTIONS");
  res.setHeader('Access-Control-Allow-Headers', "Content-Type, Authorization, X-Requested-With");
  if (req.method === "OPTIONS") {
      return res.sendStatus(200);
  }
  next();
})

const db = knex(knexConfig.development);

server.use(helmet());
server.use(express.json());

//basic get
server.get("/", (req, res) => {
  res.send("sanity check");
});

//Signup(needs updating)
server.post("/register", (req, res) => {
  const userInfo = req.body;

  const hash = bcrypt.hashSync(userInfo.password, 12);

  userInfo.password = hash;

  db("users")
    .insert(userInfo)
    .then(user => {
      if (user && bcrypt.compareSync(creds.password, user.password)) {
        // login is successful
        // create the token
        const token = generateToken(user);

        res.status(200).json({ message: `welcome ${user.name}`, token });
      } else {
        res.status(401).json({ you: "shall not pass!!" });
      }
    })
    .catch(err => 
    res.status(500) .json(err));
});

//makes the token
function generateToken(user) {
  const payload = {
    username: user.username,
    name: user.name
  };

  const secret = process.env.JWT_SECRET;

  const options = {
    expiresIn: "45m"
  };

  return jwt.sign(payload, secret, options);
}

//Signin
server.post("/login", (req, res) => {
  const creds = req.body;

  db("users")
    .where({ username: creds.username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(creds.password, user.password)) {
        // login is successful
        // create the token
        const token = generateToken(user);

        res.status(200).json({ message: `welcome ${user.name}`, token });
      } else {
        res.status(401).json({ you: "shall not pass!!" });
      }
    })
    .catch(err => res.status(500).json(err));
});


function lock(req, res, next) {
  const token = req.headers.authorization;

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) {
        res.status(401).json({ message: "invalid token" });
      } else {
        req.decodedToken = decodedToken;
        next();
      }
    });
  } else {
    res.status(401).json({ message: "no token provided" });
  }
}

// protect this endpoint so only logged in users can see it
server.get("/users", lock, async (req, res) => {
  const users = await db("users").select("id", "username", "name");

  res.status(200).json({
    users,
    decodedToken: req.decodedToken
  });
});

///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////

//tabs endpoints
/////////////////

// load usertabs
server.get("/tabs", (req, res) => {
  db("tabs")
    .then(tabs => {
      res.status(200).json(tabs);
    })
    .catch(err => {
      res.status(500).json({ error: "tabs retrival could not be performed " });
    });
});

// get tab by id
server.get("/tabs/:id", (req, res) => {
  const id = req.params.id;

  // db("tabs")
  //   // .get(id)
  //   .then(tabs => {
  //     if (tabs) {
  //       res.status(200).json({ tabs });
  //     } else {
  //       res
  //         .status(404)
  //         .json({ error: "Specified tab ID could not be found" });
  //     }
  //   })
  //   .catch(err => {
  //     res.status(404).json({ error: "Error showing that tab" });
  //   });

  if (id) {
    db("tabs")
      .where({"id":id})
      .then(tabs => {
        if (tabs !== 0) {
          res.status(200).json({ tabs });
        } else {
          res.status(404).json({ error: "tab ID does not exist" });
        }
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: "couldnt get tab. try again" });
      });
  } else {
    res.status(404).json({ error: "Provide tab ID" });
  }
});

//add new tab
server.post("/tabs", (req, res) => {
  const post = req.body;

  db("tabs")
    .insert(post)
    .then(result => {
      res.status(201).json(result);
    })
    .catch(err => {
      res.status(500).json(err);
      // ({
      //   error:
      //     "Could not add new tab."
      // });
    });
});

//delete tab
server.delete("/tabs/:id", (req, res) => {
  const id = req.params.id;

  if (id) {
    db("tabs")
      .delete(id)
      .then(result => {
        if (result !== 0) {
          res.status(200).json({ result });
        } else {
          res.status(404).json({ error: "tab ID does not exist" });
        }
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: "Deleting tab could not be performed, try again" });
      });
  } else {
    res.status(404).json({ error: "Provide tab ID for removal" });
  }
});

module.exports = server;
