const express = require("express");
const { disable } = require("express/lib/application");
const app = express();
const port = 4833;
const MongoClient = require('mongodb').MongoClient;
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const res = require("express/lib/response");
const bcrypt = require('bcrypt');
const  saltRounds = 10; 

MongoClient.connect('mongodb+srv://jhoon:wjdgns12@cluster0.whpog.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',(err,client)=>{
    if(err){return console.log(err)}

    db = client.db('todolist'); // db 지정

    app.listen(port,()=>{
        console.log("listening on",port);
    });
})

app.use(session({secret : 'secretCode', resave : false, saveUninitialized : false}))
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));
app.use('/public', express.static('public'));
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');

app.get("/",(req,res)=>{ // main page
    res.render("index.ejs", {user : req.user});
});

app.get("/write",(req,res)=>{ // 글작성 페이지
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
                db.collection('counter').updateOne({name:'게시물갯수'},{ $inc: {totalPost:1} },(err, result)=>{
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
        db.collection('hoon').deleteOne({_id : targetId}, (err,result)=>{
            db.collection('counter').updateOne({name:'게시물갯수'},{$inc:{totalPost:-1}}, (err,result)=>{
                if(!err){
                    console.log("삭제완료")
                    res.status(200).send({ message : '성공했습니다.' });
            }
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

app.put('/edit', (req,res)=>{
    targetId = parseInt(req.body.id)
    db.collection('hoon').updateOne({_id : targetId}, {$set :{제목 : req.body.title, 날짜 : req.body.date}}, (err,result)=>{
        if(!err){res.redirect('/list')}
    })
});

app.delete('/del', (req,res)=>{
    targetId = parseInt(req.body.id);
    console.log(targetId);
        db.collection('hoon').deleteOne({_id : targetId}, (err,result)=>{
            db.collection('counter').updateOne({name:'게시물갯수'},{$inc:{totalPost:-1}}, (err,result)=>{
                if(!err){
                    res.redirect('/list');
                };
            });
        });
    });

app.get('/loginPage', (req,res)=>{
    res.render('Login.ejs');
    console.log("sadf",req.user)
});

app.post("/Login", passport.authenticate('local', {
    // successRedirect: "/",
    failureRedirect : '/fail'}), (req,res)=>{
    console.log(req.session.passport.user );
    res.render('index.ejs', {user : req.session.passport.user});
});

app.get('/logout',function(req, res){
    req.session.destroy(function(){
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

app.get('/search', (req,res)=>{
    let searchCondition = [
        {
          $search: {
            index: 'titleSearch',
            text: {
              query: req.query.value,
              path: '제목'  // 제목날짜 둘다 찾고 싶으면 ['제목', '날짜']
            }
          }
        },
        { $sort :  {_id : 1} } // 검색 출력 기준 정렬 
        // { $limit : ??}  검색 제한
        // { $searchScore}  검색을 많이 한 순서대로
        // { $project : { 제목 : 1, _id : 0, score :  {$meta: "searchScore"}} }
        // 1가져옴 0 데이터 숨겨줌 
    ] 
    db.collection('hoon').aggregate(searchCondition).toArray( (err,result)=>{
        console.log(result);
        res.render('search.ejs',{result : result})
    })
})

app.get('/mypage',loginVerify, (req,res)=>{
    console.log(req.user);
    res.render('mypage.ejs', {user : req.user});
});

// 로그인 여부 확인
function loginVerify(req, res, next){
    if(req.user){
        next();
    }else{
        res.send(' not logged in yet');
    }
};

app.get('/joinUs',(req,res)=>{
    res.render('joinUs.ejs');
})

app.post('/join', (req,res)=>{
    const pw = req.body.pw;
    bcrypt.hash(pw, saltRounds, (err, hash)=> {
        console.log(hash)
        db.collection('member').insertOne({id : req.body.id, pw : hash}, (err, result)=>{
            if(!err) {res.render('index.ejs');
        };
        });
    });
})

// 로그인시 아이디 비밀번호 검증
passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: true,
  },  
  (req, id, pw, done)=> {
    db.collection('member').findOne({ id: id }, function (err, result) {
        console.log(result.id)
      if (err) return done(err)
      if (!result) return done(null, false, { message: '존재하지않는 아이디' })
      if (result){
        bcrypt.compare(pw, result.pw, function(err, check) {
            // result == true
            if(check){
                console.log('check success')
                return done(null, result)
            }else{
                console.log('check failed')
                return done(null, false, { message: '틀린비밀번호' })
            }
        });
      }
    })
  }));

// 유저 정보 세션 저장
// login이 최초로 성공했을 때만 호출되는 함수
passport.serializeUser((user, done)=>{ // result -> user
    console.log("serializeUser" );
    done(null, user.id);
});

// 사용자가 페이지를 방문할 때마다 호출되는 함수
passport.deserializeUser((id, done)=> {
    db.collection('member').findOne({id : id}, (err, result)=>{
        done(null, id);
    })
});


