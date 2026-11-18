const path = require('path');
const express = require('express');
const contestRouter = require("./routes/contest");
const bookmarkRouter = require("./routes/bookmark");
const contestHistoryRouter = require("./routes/contestHistory");
const noteRouter = require("./routes/note");
const app = express();
require('dotenv').config();
const main =  require('./config/db')
const cookieParser =  require('cookie-parser');
const authRouter = require("./routes/userAuth");
const redisClient = require('./config/redis');
const problemRouter = require("./routes/problemCreator");
const submitRouter = require("./routes/submit")
const aiRouter = require("./routes/aiChatting")
const aiReviewRouter = require("./routes/aiCodeReview");
const videoRouter = require("./routes/videoCreator");
const mockRouter = require("./routes/mockInterview");
const dashboardRouter = require("./routes/dashboard");
const learningPathRouter = require("./routes/learningPath");
const companyRouter = require("./routes/company");
const reviewRouter = require("./routes/review");
const leaderboardRouter = require("./routes/leaderboard");


const cors = require('cors')


app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true 
}))

app.use(express.json());
app.use(cookieParser());

app.use('/user',authRouter);
app.use('/problem',problemRouter);
app.use('/submission',submitRouter);
app.use('/ai',aiRouter);
app.use('/ai-review', aiReviewRouter);
app.use("/video",videoRouter);
app.use('/mock', mockRouter);
app.use('/dashboard', dashboardRouter);
app.use('/paths', learningPathRouter);
app.use('/company', companyRouter);
app.use('/review', reviewRouter);
app.use('/contest', contestRouter);
app.use('/bookmark', bookmarkRouter);
app.use('/note', noteRouter);
app.use('/contest', contestHistoryRouter);
app.use('/leaderboard', leaderboardRouter);

const InitalizeConnection = async ()=>{
    try{

        await Promise.all([main(),redisClient.connect()]);
        console.log("DB Connected");
        
        app.listen(process.env.PORT, ()=>{
            console.log("Server listening at port number: "+ process.env.PORT);
        })

    }
    catch(err){
    console.error("❌ Startup Error:");
    if (err.errors) {
        err.errors.forEach((e, i) => console.error(`  [${i+1}] ${e.message}`));
    } else {
        console.error(err);
    }
}
}


app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message });
});
app.use((_req, res) => res.status(404).json({ message: 'Not found' }));

// Serve static files from the React build folder
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// For any route that doesn't match an API endpoint, send the React index.html
app.get('/*splat', (_req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});


InitalizeConnection();