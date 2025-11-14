/**
 * Seed Forum Data
 * 
 * This script generates seed data specifically for the forum module.
 * It creates forum posts with various statuses (pending, approved, rejected).
 */

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import {
  generateStudents,
  generateTutors,
  generateManagement,
  generateForumPosts,
  generateForumComments
} from '../lib/mockData.js';

async function seedForum() {
  try {
    console.log('🌱 Starting forum seed...\n');

    // Ensure data directory exists
    const dataDir = join(process.cwd(), 'data');
    try {
      await mkdir(dataDir, { recursive: true });
      console.log('✅ Data directory created/verified\n');
    } catch (error) {
      console.log('ℹ️  Data directory already exists\n');
    }

    // Generate base users
    console.log('📊 Generating users...');
    const students = await generateStudents(20);
    const tutors = await generateTutors(15);
    const management = await generateManagement(5);
    const allUsers = [...students, ...tutors, ...management];
    console.log(`✅ Generated ${allUsers.length} users (${students.length} students, ${tutors.length} tutors, ${management.length} management)\n`);

    // Generate forum posts with various statuses
    console.log('📊 Generating forum posts...');
    const forumPosts = generateForumPosts(allUsers, 50); // Generate 50 posts with mixed statuses
    console.log(`✅ Generated ${forumPosts.length} forum posts`);
    console.log(`   - Pending: ${forumPosts.filter(p => p.status === 'pending').length}`);
    console.log(`   - Approved: ${forumPosts.filter(p => p.status === 'approved').length}`);
    console.log(`   - Rejected: ${forumPosts.filter(p => p.status === 'rejected').length}\n`);

    // Generate forum comments
    console.log('📊 Generating forum comments...');
    const forumComments = generateForumComments(forumPosts, allUsers, 80);
    console.log(`✅ Generated ${forumComments.length} forum comments\n`);

    // Write forum posts
    await writeFile(
      join(dataDir, 'forum-posts.json'),
      JSON.stringify(forumPosts, null, 2),
      'utf-8'
    );
    console.log(`✅ Created forum-posts.json with ${forumPosts.length} posts`);

    // Write forum comments
    await writeFile(
      join(dataDir, 'forum-comments.json'),
      JSON.stringify(forumComments, null, 2),
      'utf-8'
    );
    console.log(`✅ Created forum-comments.json with ${forumComments.length} comments`);

    console.log('\n🎉 Forum seeded successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Total Posts: ${forumPosts.length}`);
    console.log(`   - Pending Posts: ${forumPosts.filter(p => p.status === 'pending').length}`);
    console.log(`   - Approved Posts: ${forumPosts.filter(p => p.status === 'approved').length}`);
    console.log(`   - Rejected Posts: ${forumPosts.filter(p => p.status === 'rejected').length}`);
    console.log(`   - Total Comments: ${forumComments.length}\n`);
    console.log('💡 Note: Regular users will only see approved posts.');
    console.log('💡 Managers can see and manage all posts using the "Manage Posts" button.\n');

  } catch (error) {
    console.error('❌ Error seeding forum:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedForum();
}

export { seedForum };

