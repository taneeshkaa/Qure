require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const client = new PrismaClient();
client.location.findMany()
    .then(r => { console.log('SUCCESS', r); client.$disconnect(); })
    .catch(e => { console.error('FAIL', e.message); });