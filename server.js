const express = require("express");
const app = express();
const port = 4833;
const MongoClient = require('mongodb').MongoClient;
MongoClient.connect('mongodb+srv://jhoon:wjdgns12@cluster0.whpog.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',(err,client)=>{
    if(err){return console.log("에러에러에러")}
    app.listen(port,()=>{
        console.log("listening on",port);
    });
})

app.use(express.urlencoded({extended: true}));



app.get("/",(req,res)=>{ // main page
    res.sendFile(__dirname+"/index.html");
});

app.get("/w",(req,res)=>{ // 글작성 페이지
    res.sendFile(__dirname+"/write.html");
});

app.post("/add", (req,res)=>{ // 글작성 요청
    res.send("전송 완료");
    console.log(req.body)
});


