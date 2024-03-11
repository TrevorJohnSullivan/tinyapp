const { assert } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { getUserByEmail } = require('../helpers.js');
const expect = chai.expect;

chai.use(chaiHttp);


const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID);
  });

  it('should return a user with matching email', function() {
    const userEmail = "user@example.com";
    const user = getUserByEmail(userEmail, testUsers);
    assert.equal(user.email, userEmail);
  });

  it('should return null for a non-existent email', function() {
    const user = getUserByEmail("nonexistent@example.com", testUsers);
    assert.isNull(user);
  });
});




// provded by instructions
describe("Login and Access Control Test", () => {
  it('should return 403 status code for unauthorized access to "http://localhost:8080/urls/b2xVn2"', () => {
    const agent = chai.request.agent("http://localhost:8080");

    // Step 1: Login with valid credentials
    return agent
      .post("/login")
      .send({ email: "user2@example.com", password: "dishwasher-funk" })
      .then((loginRes) => {
        // Step 2: Make a GET request to a protected resource
        return agent.get("/urls/b2xVn2").then((accessRes) => {
          // Step 3: Expect the status code to be 403
          expect(accessRes).to.have.status(403);
        });
      });
  });
});

describe('URL Access Control Tests', () => {
    let agent;

    before(() => {
        agent = chai.request.agent('http://localhost:8080');
    });

    it('should redirect GET request to "/" to "/login"', () => {
        return agent.get("/").redirects(0).end((_, res) => {
            expect(res).to.redirect;
            expect(res).to.have.status(302);
            expect(res).to.redirectTo('/login');
        });
    });

    it('should redirect GET request to "/urls/new" to "/login"', () => {
        return agent.get('/urls/new').redirects(0).end((_, res) => {
            expect(res).to.redirect;
            expect(res).to.have.status(302);
            expect(res).to.redirectTo('/login');
        });
    });

    it('should return 404 status code for GET request to "/urls/NOTEXISTS"', () => {
        return agent
            .post('/register')
            .send({ email: '1@1.com', password: '1' })
            .then((registerRes) => {
                expect(registerRes).to.have.status(200);
                return agent.get('/urls/NOTEXISTS')
                    .then((protectedRes) => {
                        expect(protectedRes).to.have.status(404);
                    });
            });

    });

    it('should return 403 status code for GET request to "/urls/b2xVn2"', () => {
        return chai.request.agent('http://localhost:8080').get('/urls/b2xVn2')
            .then((res) => {
                expect(res).to.have.status(403);
            });
    });
});