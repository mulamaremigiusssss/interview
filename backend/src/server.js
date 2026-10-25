const app = require('./app');
const migrate = require('./migrate');
const { port } = require('./config');

migrate()
  .then(() => app.listen(port, () => console.log(`API listening on http://localhost:${port}`)))
  .catch((err) => {
    console.error('Failed to start:', err);
    process.exit(1);
  });
