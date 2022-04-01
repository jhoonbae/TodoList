const express = require("express");
const app = express();
const port = 4833;
const MongoClient = require('mongodb').MongoClient;
MongoClient.connect('mongodb+srv://jhoon:wjdgns12@cluster0.whpog.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',(err,client)=>{
    if(err){return console.log(err)}

    db = client.db('todolist'); // db 지정

    app.listen(port,()=>{
        console.log("listening on",port);
    });
})

app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');

app.get("/",(req,res)=>{ // main page
    res.sendFile(__dirname+"/index.html");
});

app.get("/w",(req,res)=>{ // 글작성 페이지
    res.sendFile(__dirname+"/write.html");
});

app.post("/add", (req,res)=>{ // 글작성 요청
    res.send("전송 완료");
    console.log(req.body.title);
    console.log(req.body.date);

    var title = req.body.title;
    var date = req.body.date;

    // hoon collection에 데이터 삽입
    db.collection('hoon').insertOne({제목 : title, 날짜 : date}, (err,res)=>{ // db 저장 형식
        console.log('저장완료');
    });
});

app.get('/list',(req,res)=>{
    // find = select * , toarray로 원하는 형식으로 가져온다.
    db.collection('hoon').find().toArray((err,result)=>{
        // console.log(result);
        res.render('list.ejs', {result : result}); // ejs에 넘겨줄 결과값 지정
    });
    
});
