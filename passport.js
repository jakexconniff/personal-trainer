const LocalStrategy = require(`passport-local`).Strategy;
const admin = require(`firebase-admin`);
const serviceAccount = require(`./firebase-key.json`);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://personal-trainer-49ca7.firebaseio.com/`
});

const db = admin.database();
const ref = db.ref(`/`);

function LocalPassport() {

}

module.exports = LocalPassport;
