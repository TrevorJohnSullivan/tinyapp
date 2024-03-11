const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const { getUserByEmail, generateRandomString, urlsForUser } = require('./helpers');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'session',
  keys: ["this is my key value?"],
}));

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};



app.use(express.urlencoded({ extended: false }));

app.use(express.json());

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  if (!user) {
    res.status(403).send("Email address not found");
    return;
  }
  if (!bcrypt.compareSync(req.body.password, user.password)) {
    res.status(403).send("Incorrect password");
    return;
  }
  req.session.user_id = user.id;
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    res.status(403).send("<html><body>You need to be logged in to edit URLs.</body></html>");
    return;
  }
  if (!urlDatabase[req.params.id]) {
    res.status(404).send("<html><body>URL not found.</body></html>");
    return;
  }

  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    res.status(403).send("<html><body>You don't have permission to edit this URL.</body></html>");
    return;
  }
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  if (!req.session.user_id) {
    res.status(403).send("<html><body>You need to be logged in to delete URLs.</body></html>");
    return;
  }
  if (!urlDatabase[req.params.id]) {
    res.status(404).send("<html><body>URL not found.</body></html>");
    return;
  }
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    res.status(403).send("<html><body>You don't have permission to delete this URL.</body></html>");
    return;
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if (!longURL) {
    res.status(404).send("<html><body>Shortened URL not found.</body></html>");
    return;
  }
  res.redirect(longURL);
});

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Email and password cannot be empty");
    return;
  }
  for (const userId in users) {
    if (users[userId].email === req.body.email) {
      res.status(400).send("Email already exists");
      return;
    }
  }
  const userID = generateRandomString(12);
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  const newUser = {
    id: userID,
    email: req.body.email,
    password: hashedPassword,
  };
  users[userID] = newUser;
  req.session.user_id = userID;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.status(403).send("<html><body>You need to be logged in to create a new URL.</body></html>");
    return;
  }
  if (!req.body.longURL) {
    res.status(400).send("<html><body>The URL field cannot be empty.</body></html>");
    return;
  }
  const randomString = generateRandomString(6);
  urlDatabase[randomString] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${randomString}`);
});

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
    return;
  }
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
    return;
  }
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("login", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
    return;
  }
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    res.status(403).send("<html><body>You need to be logged in to access this page.</body></html>");
    return;
  }
  if (!urlDatabase[req.params.id]) {
    res.status(404).send("<html><body>URL not found.</body></html>");
    return;
  }
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    res.status(403).send("<html><body>You don't have permission to access this page.</body></html>");
    return;
  }
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.status(403).send("<html><body>You need to be logged in to see URLs.</body></html>");
    return;
  }
  const userURLs = urlsForUser(req.session.user_id, urlDatabase);
  const templateVars = {
    urls: userURLs,
    user: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  res.status(302).redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});