import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app/app.module';
import { VKM_REPOSITORY } from '../application/vkm/ports/vkm-repository.port';
import type { IVkmRepository } from '../application/vkm/ports/vkm-repository.port';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Migration script to import VKM data from CSV
 * Usage: npm run migrate:vkm
 */
async function importVkmData() {
  console.log('🚀 Starting VKM data migration...');

  // Bootstrap the application
  const app = await NestFactory.createApplicationContext(AppModule);
  const vkmRepository = app.get<IVkmRepository>(VKM_REPOSITORY);

  // Read CSV file
  const csvPath = path.join(
    __dirname,
    '../../Preview__Overzicht_Avans_VKM_portfolio_clean_utf8_csv.csv',
  );

  if (!fs.existsSync(csvPath)) {
    console.error('❌ CSV file not found at:', csvPath);
    await app.close();
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',');

  console.log(`📊 Found ${lines.length - 1} VKM records in CSV`);

  let successCount = 0;
  let errorCount = 0;

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      // Parse CSV line (basic parsing - might need enhancement for complex CSVs)
      const values = line.split(',');
      
      const vkmData = {
        name: values[1] || 'Unnamed VKM',
        shortDescription: values[2] || '',
        description: values[3] || '',
        content: values[4] || '',
        studyCredit: parseInt(values[5]) || 0,
        location: values[6] || 'Unknown',
        contactId: values[7] || '',
        level: values[8] || 'NLQF5',
        learningOutcomes: values[9] || '',
        isActive: true,
      };

      await vkmRepository.create(vkmData);
      successCount++;
      console.log(`✅ Imported: ${vkmData.name}`);
    } catch (error) {
      errorCount++;
      console.error(`❌ Error importing line ${i}:`, error.message);
    }
  }

  console.log('\n📈 Migration Summary:');
  console.log(`   ✅ Successfully imported: ${successCount} VKMs`);
  console.log(`   ❌ Errors: ${errorCount}`);

  await app.close();
  console.log('✨ Migration completed!');
}

// Run the migration
importVkmData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
