require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const knex = require("knex");
const bcrypt = require("bcryptjs"); // added
const jwt = require("jsonwebtoken");

const knexConfig = require("../knexfile");

const server = express();

const db = knex(knexConfig.development);

server.use(helmet());
server.use(express.json());


//basic get
server.get("/", (req, res) => {
  res.send("sanity check");
});


//register(needs updating)
server.post("/register", (req, res) => {
  const userInfo = req.body;

  const hash = bcrypt.hashSync(userInfo.password, 12);

  userInfo.password = hash;

  db("users")
    .insert(userInfo)
    .then(ids => {
      res.status(201).json(ids);
    })
    .catch(err => res.status(500).json(err));
});


//makes the token
function generateToken(user) {
  const payload = {
    username: user.username,
    name: user.name,
  };

  const secret = process.env.JWT_SECRET;

  const options = {
    expiresIn: "45m"
  };

  return jwt.sign(payload, secret, options);
}


//login
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
  // the auth token is normally sent in the Authorization header
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


// get all tabs
router.get("/tabs", (req, res) => {
  projectDB
    .get()
    .then(projects => {
      res.status(200).json(projects);
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: "projects retrival could not be performed " });
    });
});


router.post("/tabs", (req, res) => {
  const post = req.body;

    projectDB
      .insert(post)
      .then(result => {
        res.status(201).json(result);
      })
      .catch(err => {
        res
          .status(500)
          .json(err)
          // ({
          //   error:
          //     "Could not add new project. Provide projectID, notes, description and try again."
          // });
      });
    });



router.delete("/tabs/:id", (req, res) => {
  const id = req.params.id;

  if (id) {
    projectDB
      .remove(id)
      .then(result => {
        if (result !== 0) {
          res.status(200).json({ result });
        } else {
          res.status(404).json({ error: "project ID does not exist" });
        }
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: "Deleting project could not be performed, try again" });
      });
  } else {
    res.status(404).json({ error: "Provide project ID for removal" });
  }
});

module.exports = server;
