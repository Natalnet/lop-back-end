module.exports = {
    // 1. MongoDB
    MONGO_URI: process.env.MONGO_URI || 'mongodb://lop:plataformalop@localhost:27017/lop',
  
    // 2. JWT
    TOKEN_SECRET: process.env.TOKEN_SECRET || 'aMVzxbJ4oxUCQ3TfYK675SUUA8vZOtCfd3b1jhV9OjfxrsvHJTOcG0yoylQOWBn',
  
    // 3. Express Server Port
    LISTEN_PORT: process.env.LISTEN_PORT || 3001
  };