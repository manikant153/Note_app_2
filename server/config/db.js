const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const connectDB = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`Connected to Database: ${connect.connection.host}`);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;
