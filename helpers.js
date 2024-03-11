const getUserByEmail = function (email, database) {
  for (const userId in database) {
    if (database[userId].email === email) {
      return database[userId];
    }
  }
  return null;
};

const generateRandomString = function (length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < length; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
};

const urlsForUser = function (id, database) {
  const filteredURLs = {};
  for (const key in database) {
    if (database[key].userID === id) {
      filteredURLs[key] = database[key];
    }
  }
  return filteredURLs;
};


module.exports = { getUserByEmail, generateRandomString, urlsForUser };