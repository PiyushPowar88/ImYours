const app = require('./src/app');
const { testConnection } = require('./src/config/db');
const env = require('./src/config/env');
const { releaseStaleBookings } = require('./src/services/cleanup.service');

(async () => {
  await testConnection();
  app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
  });

  // Run cleanup every 5 minutes
  setInterval(releaseStaleBookings, 5 * 60 * 1000);
})();