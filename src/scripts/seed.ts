import { seedRegistry } from './seed-registry';

(async () => {
  try {
    await seedRegistry();
    console.log('✅ Seed completed successfully');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
})();
