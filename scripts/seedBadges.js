// scripts/seedBadges.js
const admin = require('firebase-admin');
const seed = require('../plataforma-inclusiva/src/data/badgesSeed.json');

admin.initializeApp({
  credential: admin.credential.cert(require('./taller-de-proyectos-fa7ee-firebase-adminsdk-fbsvc-dc514a089e.json'))
});

const db = admin.firestore();

async function run() {
  const batch = db.batch();
  seed.forEach(badge => {
    const ref = db.collection('badgesMaster').doc(badge.id);
    batch.set(ref, badge);
  });
  await batch.commit();
  console.log(`✅  ${seed.length} badges importados`);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
