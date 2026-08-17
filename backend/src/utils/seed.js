require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const Department = require('../models/Department');

const DEPARTMENTS = [
  { name: 'Road Maintenance', code: 'ROAD', categories: ['Road Damage'], description: 'Potholes, damaged roads and sidewalks.' },
  { name: 'Water Department', code: 'WATER', categories: ['Water Supply'], description: 'Water leakage and supply issues.' },
  { name: 'Electrical Department', code: 'ELECTRICAL', categories: ['Electrical Infrastructure'], description: 'Streetlights and electrical infrastructure.' },
  { name: 'Sanitation Department', code: 'SANITATION', categories: ['Sanitation', 'Public Infrastructure'], description: 'Garbage collection and public toilets.' },
  { name: 'Drainage Department', code: 'DRAINAGE', categories: ['Drainage'], description: 'Drainage and waterlogging issues.' },
  { name: 'Parks & Environment Department', code: 'PARKS', categories: ['Environmental Hazard'], description: 'Fallen trees and environmental hazards.' },
  { name: 'Animal Control Department', code: 'ANIMAL', categories: ['Public Safety'], description: 'Stray animal related public issues.' },
  { name: 'General Services', code: 'GENERAL', categories: ['General'], description: 'Miscellaneous civic issues.' },
];

async function seed() {
  await connectDB();

  console.log('Seeding departments...');
  for (const dept of DEPARTMENTS) {
    await Department.findOneAndUpdate({ code: dept.code }, dept, { upsert: true, new: true });
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@civicfix.gov';
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    console.log('Creating default admin account...');
    await User.create({
      name: 'CivicFix Admin',
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || 'Admin@12345',
      role: 'admin',
      phone: '',
    });
  } else {
    console.log('Admin account already exists, skipping.');
  }

  console.log('Seed complete.');
  console.log(`Admin login -> email: ${adminEmail} / password: ${process.env.ADMIN_PASSWORD || 'Admin@12345'}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
