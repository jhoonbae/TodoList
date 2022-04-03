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

app.use('/public', express.static('public'));
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');

app.get("/",(req,res)=>{ // main page
    res.render("index.ejs");
});

app.get("/w",(req,res)=>{ // 글작성 페이지
    res.render("write.ejs");
});

app.post("/add", (req,res)=>{ // 글작성 요청
    var title = req.body.title;
    var date = req.body.date; 
    db.collection('counter').findOne({name : '게시물갯수'}, (err, result)=>{
        var total = result.totalPost;
            // hoon collection에 데이터 삽입
            db.collection('hoon').insertOne({_id : total + 1, 제목 : title, 날짜 : date}, (err,result)=>{ // db 저장 형식
                // counter collection에 tost개수 auto increase
                db.collection('counter').updateOne({name:'게시물갯수'},{ $inc: {totalPost:1} },function(err, result){
                    if(err){return console.log(err)}
                    res.render('write.ejs');
                });
            });
        });
    });

app.get('/list',(req,res)=>{
    // find = select * , toarray로 원하는 형식으로 가져온다.
    db.collection('hoon').find().toArray((err,result)=>{
        // console.log(result);
        res.render('list.ejs', {result : result}); // ejs에 넘겨줄 결과값 지정
    });
    
});

app.delete('/delete', (req,res)=>{
    console.log(req.body);
    targetId = parseInt(req.body._id);
    db.collection('counter').findOne({name : '게시물갯수'}, (err, result)=>{
        var total = result.totalPost;
        db.collection('hoon').deleteOne({_id : targetId}, (err,result)=>{
            db.collection('counter').updateOne({name:'게시물갯수'},{$inc:{totalPost:-1}}, (err,result)=>{
                if(!err){
                    console.log("삭제완료")
                    res.status(200).send({ message : '성공했습니다.' });
                }
            });
        });
    });
});

// : => 뒤에 오는 문자열에 맞게 응답.
app.get('/detail/:id', (req,res)=>{
    db.collection('hoon').findOne({_id : parseInt(req.params.id)},(err, result)=>{
        if(err){
            res.send("페이지 오류입니다")
        }else{
            console.log(result);
            res.render('detail.ejs', {data : result});
        };
    });
});

app.get('/edit/:id', (req,res)=>{
    db.collection('hoon').findOne({_id : parseInt(req.params.id)},(err, result)=>{
        if(err){
            res.send("페이지 오류입니다");
        }else{
            console.log(result);
            res.render('edit.ejs', {data : result});
        };
    });
});