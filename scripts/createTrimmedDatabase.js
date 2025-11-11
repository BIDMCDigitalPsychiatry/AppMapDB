const AWS = require('aws-sdk');

// ===================================================================
// 🔒 SAFETY NOTICE: TABLE CREATION AND INSERT SCRIPT
// ===================================================================
// This script creates a NEW table (applications_trimmed) and copies
// only the records we want to keep from the original applications table.
// The original applications table is NEVER modified.
// Operations: CREATE TABLE, INSERT (to new table only)
// ===================================================================

AWS.config.region = 'us-east-1';
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: 'us-east-1:d6802415-4c63-433c-92f5-4a5c05756abe'
});

const dynamo = new AWS.DynamoDB.DocumentClient();
const dynamoRaw = new AWS.DynamoDB(); // For table creation
const sourceTableName = 'applications';
const targetTableName = 'applications_trimmed';

function isEmpty(str) {
  return !str || 0 === str.length;
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

const deleteTable = async (tableName) => {
  console.log(`🗑️  Checking if table ${tableName} exists...`);
  
  try {
    // Check if table exists
    await dynamoRaw.describeTable({ TableName: tableName }).promise();
    console.log(`🗑️  Table ${tableName} exists, deleting it...`);
    
    // Delete the table
    await dynamoRaw.deleteTable({ TableName: tableName }).promise();
    console.log(`⏳ Waiting for table ${tableName} to be deleted...`);
    
    // Wait for table to be deleted
    await dynamoRaw.waitFor('tableNotExists', { TableName: tableName }).promise();
    console.log(`✅ Table ${tableName} successfully deleted`);
    
  } catch (error) {
    if (error.code === 'ResourceNotFoundException') {
      console.log(`✅ Table ${tableName} does not exist, ready to create new one`);
    } else {
      console.error(`❌ Error checking/deleting table ${tableName}:`, error);
      throw error;
    }
  }
};

const createTable = async (tableName) => {
  console.log(`🔧 Creating new table: ${tableName}`);
  
  const tableParams = {
    TableName: tableName,
    KeySchema: [
      {
        AttributeName: '_id',
        KeyType: 'HASH'
      }
    ],
    AttributeDefinitions: [
      {
        AttributeName: '_id',
        AttributeType: 'S'
      }
    ],
    BillingMode: 'PAY_PER_REQUEST' // On-demand billing
  };

  try {
    const result = await dynamoRaw.createTable(tableParams).promise();
    console.log(`✅ Table ${tableName} created successfully`);
    
    // Wait for table to become active
    console.log('⏳ Waiting for table to become active...');
    await dynamoRaw.waitFor('tableExists', { TableName: tableName }).promise();
    console.log(`✅ Table ${tableName} is now active and ready for use`);
    
    return result;
  } catch (error) {
    if (error.code === 'ResourceInUseException') {
      console.log(`⚠️  Table ${tableName} already exists, checking if it's active...`);
      
      // Check table status
      const describeResult = await dynamoRaw.describeTable({ TableName: tableName }).promise();
      if (describeResult.Table.TableStatus === 'ACTIVE') {
        console.log(`✅ Table ${tableName} is already active and ready for use`);
      } else {
        console.log('⏳ Waiting for existing table to become active...');
        await dynamoRaw.waitFor('tableExists', { TableName: tableName }).promise();
        console.log(`✅ Table ${tableName} is now active`);
      }
    } else {
      throw error;
    }
  }
};

const getAllRecords = async (tableName) => {
  console.log(`📥 Reading all records from ${tableName}...`);
  let scanResults = [];
  let items;
  var params = {
    TableName: tableName,
    ExclusiveStartKey: undefined
  };
  
  do {
    items = await dynamo.scan(params).promise();
    items.Items.forEach(i => scanResults.push(i));
    params.ExclusiveStartKey = items.LastEvaluatedKey;
    process.stdout.write(`\r   Downloaded ${scanResults.length} records...`);
  } while (typeof items.LastEvaluatedKey != 'undefined');
  
  console.log(`\n✅ Download complete: ${scanResults.length} total records`);
  return scanResults;
};

const getRecordsToKeep = (allRecords) => {
  console.log('\n🔍 Analyzing which records to keep...');
  
  // Filter out draft and deleted records (same logic as useAppTableData)
  const validRecords = allRecords.filter(app => 
    app.draft !== true && 
    app.delete !== true
  );
  
  console.log(`📋 Valid Records (not draft/deleted): ${validRecords.length}`);
  
  // Apply the EXACT same logic as useAppTableData.tsx for WEBSITE DISPLAY
  const data = validRecords.map(app => ({
    _id: app._id,
    created: app.created,
    approved: app.approved,
    groupId: isEmpty(app.groupId) ? app._id : app.groupId,
    name: app.name,
    fullApp: app // Store full app for reference
  }));
  
  const groupIds = data.map(r => r.groupId).filter(onlyUnique);
  console.log(`🔗 Unique Groups (by groupId): ${groupIds.length}`);
  
  let recordsToKeep = [];
  let approvedAppsCount = 0;
  let groupsWithNoApproved = 0;
  let newerUnapprovedRecords = [];
  
  // STEP 1: Keep records that show on WEBSITE (useAppTableData logic)
  groupIds.forEach(gId => {
    const groupMembers = data.filter(r => r.groupId === gId);
    const sortedAsc = groupMembers.sort((a, b) => b.created - a.created); // Sort by newest first
    
    let newest = sortedAsc[0]; // Set the newest record, regardless of approval status
    
    // Search all records from newest down to find the newest approved entry
    for (let i = 0; i < sortedAsc.length; i++) {
      if (sortedAsc[i].approved === true) {
        newest = sortedAsc[i];
        break;
      }
    }
    
    // Keep the record that shows on website
    recordsToKeep.push(newest.fullApp);
    
    // Count stats for website display
    if (newest.approved === true) {
      approvedAppsCount++;
    } else {
      groupsWithNoApproved++;
    }
  });
  
  // STEP 2: Keep ALL unapproved records for PENDING TAB (usePendingAppData logic)
  // The pending tab shows ALL unapproved records, not just website display records
  const allUnapprovedRecords = validRecords.filter(app => 
    app.approved !== true
  );
  
  console.log(`⏳ Total unapproved records (for pending tab): ${allUnapprovedRecords.length}`);
  
  // Add any unapproved records that weren't already added in step 1
  allUnapprovedRecords.forEach(app => {
    const alreadyAdded = recordsToKeep.some(existing => existing._id === app._id);
    if (!alreadyAdded) {
      recordsToKeep.push(app);
      newerUnapprovedRecords.push(app);
    }
  });

  // STEP 3: Keep records that serve as groupId references (preserve app history relationships)
  // Find all unique groupIds that other records reference
  const referencedGroupIds = new Set();
  validRecords.forEach(app => {
    const gId = isEmpty(app.groupId) ? app._id : app.groupId;
    referencedGroupIds.add(gId);
  });
  
  // Keep any record whose _id is used as a groupId by other records
  // This ensures app history dialog can find the "parent" record
  let relationshipRecordsAdded = 0;
  validRecords.forEach(app => {
    if (referencedGroupIds.has(app._id)) {
      const alreadyAdded = recordsToKeep.some(existing => existing._id === app._id);
      if (!alreadyAdded) {
        recordsToKeep.push(app);
        relationshipRecordsAdded++;
      }
    }
  });

  console.log(`✅ Records to keep: ${recordsToKeep.length}`);
  console.log(`   - Website display records: ${groupIds.length}`);
  console.log(`   - Unapproved records (pending tab): ${allUnapprovedRecords.length}`);
  console.log(`   - Relationship records (preserve app history): ${relationshipRecordsAdded}`);
  console.log(`   - Approved apps: ${approvedAppsCount}`);
  console.log(`   - Groups with no approved: ${groupsWithNoApproved}`);
  
  return recordsToKeep;
};

const insertRecordsInBatches = async (tableName, records) => {
  console.log(`\n📤 Inserting ${records.length} records into ${tableName}...`);
  
  const batchSize = 25; // DynamoDB limit for batch writes
  let insertedCount = 0;
  
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    
    const batchParams = {
      RequestItems: {
        [tableName]: batch.map(record => ({
          PutRequest: {
            Item: record
          }
        }))
      }
    };
    
    try {
      await dynamo.batchWrite(batchParams).promise();
      insertedCount += batch.length;
      process.stdout.write(`\r   Inserted ${insertedCount}/${records.length} records...`);
    } catch (error) {
      console.error(`\n❌ Error inserting batch starting at index ${i}:`, error);
      throw error;
    }
    
    // Small delay to avoid throttling
    if (i + batchSize < records.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log(`\n✅ Successfully inserted ${insertedCount} records into ${tableName}`);
};

const verifyNewTable = async (tableName, expectedCount) => {
  console.log(`\n🔍 Verifying new table ${tableName}...`);
  
  // Get count of records in new table
  const scanParams = {
    TableName: tableName,
    Select: 'COUNT'
  };
  
  let totalCount = 0;
  let scanResult;
  
  do {
    scanResult = await dynamo.scan(scanParams).promise();
    totalCount += scanResult.Count;
    scanParams.ExclusiveStartKey = scanResult.LastEvaluatedKey;
  } while (scanResult.LastEvaluatedKey);
  
  console.log(`📊 Records in new table: ${totalCount}`);
  console.log(`📊 Expected records: ${expectedCount}`);
  
  if (totalCount === expectedCount) {
    console.log('✅ Verification successful! Record counts match.');
  } else {
    console.log('⚠️  Warning: Record counts do not match!');
  }
  
  return totalCount;
};

const trimDatabase = async () => {
  try {
    console.log('🚀 Database Trimming Process - RESET AND CREATE TABLE');
    console.log('====================================================');
    console.log('🔒 SAFETY: Original applications table will NOT be modified');
    console.log('�️  Will delete existing applications_trimmed table if it exists');
    console.log('�📋 Creating new trimmed table with only necessary records');
    console.log('====================================================\n');
    
    // Step 1: Delete existing trimmed table if it exists
    await deleteTable(targetTableName);
    
    // Step 2: Create new table
    await createTable(targetTableName);
    
    // Step 3: Get all records from source table
    const allRecords = await getAllRecords(sourceTableName);
    
    // Step 4: Determine which records to keep
    const recordsToKeep = getRecordsToKeep(allRecords);
    
    // Step 5: Insert records into new table
    await insertRecordsInBatches(targetTableName, recordsToKeep);
    
    // Step 6: Verify the new table
    await verifyNewTable(targetTableName, recordsToKeep.length);
    
    // Final summary
    console.log(`\n🎉 DATABASE TRIMMING COMPLETE!`);
    console.log(`===============================`);
    console.log(`📊 Original table (${sourceTableName}): ${allRecords.length} records`);
    console.log(`📊 New table (${targetTableName}): ${recordsToKeep.length} records`);
    console.log(`💾 Space reduction: ${((allRecords.length - recordsToKeep.length) / allRecords.length * 100).toFixed(1)}%`);
    console.log(`🔒 Original table remains unchanged for safety`);
    
    console.log(`\n📋 NEXT STEPS:`);
    console.log(`==============`);
    console.log(`1. Test your application with the new table name: "${targetTableName}"`);
    console.log(`2. Verify all functionality works correctly`);
    console.log(`3. Once confident, you can switch your app to use the new table`);
    console.log(`4. Keep the original table as backup until you're 100% sure`);
    
    return {
      originalRecords: allRecords.length,
      trimmedRecords: recordsToKeep.length,
      spaceSavings: ((allRecords.length - recordsToKeep.length) / allRecords.length * 100).toFixed(1)
    };
    
  } catch (error) {
    console.error('❌ Error during database trimming:', error);
    throw error;
  }
};

// Confirmation prompt
console.log('⚠️  CONFIRMATION REQUIRED ⚠️');
console.log('============================');
console.log(`This script will RESET the table: "${targetTableName}"`);
console.log(`- If "${targetTableName}" exists, it will be DELETED first`);
console.log(`- Then create a fresh table and copy selected records from: "${sourceTableName}"`);
console.log('- The original table will NOT be modified.');
console.log('');
console.log('To proceed, run: node createTrimmedDatabase.js --confirm');
console.log('');

// Check for confirmation flag
const args = process.argv.slice(2);
if (args.includes('--confirm')) {
  trimDatabase().catch(console.error);
} else {
  console.log('❌ Script not executed. Add --confirm flag to proceed.');
  console.log('Example: node createTrimmedDatabase.js --confirm');
}