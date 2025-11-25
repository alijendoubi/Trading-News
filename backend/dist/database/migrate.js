import { initializeSchema } from './init.js';
import { logger } from '../config/logger.js';
import { initializeDb, closeDb } from '../config/db.js';
(async () => {
    try {
        await initializeDb();
        await initializeSchema();
        logger.info('Database migration completed.');
    }
    catch (err) {
        logger.error('Migration failed', { err });
        process.exit(1);
    }
    finally {
        await closeDb();
    }
})();
//# sourceMappingURL=migrate.js.map