import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from '../infrastructure/auth/database/schemas/user.schema';

/**
 * Script to rebuild MongoDB indexes for case-insensitive username
 * This is needed after adding the new username index
 * 
 * Usage: npm run rebuild-indexes
 */
async function rebuildIndexes() {
  console.log('🔧 Starting index rebuild...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const userModel = app.get<Model<UserDocument>>(getModelToken(UserDocument.name));

  try {
    console.log('📋 Current indexes:');
    const indexes = await userModel.collection.getIndexes();
    console.log(indexes);

    console.log('\n🗑️  Dropping old indexes (except _id)...');
    await userModel.collection.dropIndexes();
    
    console.log('✨ Creating new indexes...');
    await userModel.syncIndexes();
    
    console.log('\n📋 New indexes:');
    const newIndexes = await userModel.collection.getIndexes();
    console.log(newIndexes);
    
    console.log('\n✅ Index rebuild completed successfully!');
    console.log('\n⚠️  Note: You may need to remove duplicate usernames manually if they exist.');
    console.log('   Run this query in MongoDB to check for duplicates:');
    console.log('   db.userdocuments.aggregate([');
    console.log('     { $group: { _id: { $toLower: "$username" }, count: { $sum: 1 }, docs: { $push: "$$ROOT" } } },');
    console.log('     { $match: { count: { $gt: 1 } } }');
    console.log('   ])');
    
  } catch (error) {
    console.error('❌ Error rebuilding indexes:', error);
  } finally {
    await app.close();
  }
}

rebuildIndexes()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Failed to rebuild indexes:', error);
    process.exit(1);
  });
