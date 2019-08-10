module.exports =
{
    // 1. MongoDB
    //MONGO_URI: process.env.MONGO_URI || 'mongodb://@localhost:27017/lop',
    MONGO_URI: process.env.MONGO_URI || 'mongodb+srv://plataforma:plataforma@cluster0-uygym.mongodb.net/lop?retryWrites=true&w=majority',
    //JWT
    TOKEN_SECRET: process.env.TOKEN_SECRET || "2e112d4192825784f91bd29d33eaf0f1",
    // 3. Express Server Port
    LISTEN_PORT: process.env.LISTEN_PORT || 3001
}
