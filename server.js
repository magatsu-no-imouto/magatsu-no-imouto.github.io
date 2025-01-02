
const {createPool}=require('mysql')
const exp = require('express');
const port = 8080;
const app=exp();

//replace these when y'all decide to host it.
const conn=createPool({
    host:'localhost',
    user:'root',
    password:'password',
    database:'sys'
})
//it'll be after I'm gone anyway~

const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.listen(port,()=>{
    conn.getConnection((err,connection)=>{
        if (err) {
            console.error('Error connecting to database:', err);
            return;
        }
        console.log('Connected to database!');
        connection.release();
    })    
    console.log(`Connecto, ${port}`);
    });

    const cors=require('cors')
    const cookieP=require('cookie-parser');
    const multer=require('multer');
    const puppeteer=require('puppeteer')
    const path=require('path')
    const fs = require("fs");

app.post('/generate-pdf', async (req, res) => {
    const { sectA,sectB,content,repName,headR,count} = req.body;
    const imagePath=path.join(__dirname, 'public', 'media', 'pgcLogo.png');
    try{
        console.log("converting image path")
        const imageBuffer = await fs.promises.readFile(imagePath);
        console.log("turning it into base 64")
        const imageBase64 = imageBuffer.toString('base64');
        const imageSrc = `data:image/png;base64,${imageBase64}`;
        console.log("activating puppeteer")
        const browser = await puppeteer.launch({headless:true});
        console.log("transcibing contents.")
        console.log("this one usually takes the longest")
    const page = await browser.newPage();
    const combinedHTML=`
    <html>
        <head>
          <style>
          html {
            -webkit-print-color-adjust: exact;
          }
          @page{
            margin:1cm;
            margin-footer: 1px;
          }
          table {
              border-collapse: collapse;
              width: 100%;
          }
       th, td {
              border: 1px solid black;
          }
          th{
            text-align:center;
            margin-top:5cm;
            
          }
          th, td {
              padding: 8px;
              page-break-inside: avoid;
              text-align: center;
          }
          h1{
            position:fixed;
            font-family: Impact,  'Arial Narrow Bold', sans-serif;
            top:18;
            left:63;
            margin-left:60px;
            text-align:center;
          }
          .scroll2{
            font-size: 12px;
            background-color: transparent;
            border: none;
            max-width: fit-content;
            overflow-y: auto;
            white-space: nowrap;
            text-align:center;
            padding: 0;
        }
        .stick{
            background-color: #0099FF;
            z-index: 2;
            height: 50px;
            border-bottom: black solid 5px;
        }
      </style>
        </head>
        <body>
        <img src="${imageSrc}" style="position:fixed;left:20;top:0;margin-top: 10px; width: 130px;"></img>
       <h1>PROVINCIAL INFORMATION AND COMMUNICATIONS TECHNOLOGY OFFICE</h1>
       <div class="page">
       <table>
       <thead>
       <tr><th colspan='${count}' style="border-left:none; border-right:none; border-top:none; border-bottom:solid 5px black;"><p style="font-size:115px; color:transparent;">a</p></th></tr>
       <tr><th style="border:none;" colspan='${count}'>${repName} ${sectA} ${sectB}</th></tr>
       ${headR}
       </thead>
       <tbody>
       ${content}
       </tbody>
       </table>
       </div>
        </body>
      </html>`
  
  const dt=new Date()
  dt.getDate()
  console.log("contents transcribed")
  await page.setContent(combinedHTML);
  console.log("configuring pdf")
    const pdfBuffer = await page.pdf({
        format: 'A4',
        displayHeaderFooter: true,
        footerTemplate: `
        <div style="border-top: solid 1px #bbb; width: 100%; font-size: 9px;
            padding: 5px 5px 0; color: #bbb; position: relative;">
            <div style="position: absolute; left: 5px; top: 5px;"><span class="date"></span></div>
            <div style="position: absolute; right: 5px; top: 5px;"><span class="pageNumber"></span>/<span class="totalPages"></span></div>
        </div>
      `,
        margin: { bottom: '70px' },
      });
    const filePath = `./_report.pdf`;
    fs.writeFileSync(filePath, pdfBuffer);
    console.log("closing puppeteer")
    await browser.close();
    console.log("T R A N S F E R")
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename='report.pdf'`);
  
    const absolutePath = path.resolve(filePath);
    res.download(absolutePath, `report.pdf`, (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error sending the file');
      } else {
        fs.unlinkSync(filePath); // Delete the file after sending
      }
    });
    }catch(err){
        console.error(err);
        res.status(500).send('Error generating PDF');
    }
  });

  

    const upload = multer({
        storage: multer.diskStorage({
          destination: 'public/media/',
          filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            cb(null, req.body.fieldname + ext);
          }
        })
      });

      app.post('/uploadI',upload.single('image'),async (req, res) => {
        try {
            res.status(200).send('Image uploaded successfully');
        } catch (err) {
            console.error('Error uploading image', err);
            res.status(500).send('Internal Server Error');
        }
    })
    
    app.use(cors())
    app.use(cookieP())
    app.use(exp.json())
    app.set('view engine','ejs')
    app.set('views',__dirname+'/views')
    
    app.post('/renameI',async(req,res)=>{
        const {oldpath, newpath }=req.body;
        let init=__dirname+"/public/"+oldpath
        let newP=__dirname+"/public/"+newpath
        if (!fs.existsSync(init)) {
            console.error(`Old path file "${init}" does not exist`);
            return res.status(404).send("Old path file does not exist");
        }
            fs.rename(init,newP,(err)=>{
                if(err){
                    console.log(err)
                }else{
                    console.log("Success!")
                }
            })
        
        
    })
    
    app.post('/removeI',async(req,res)=>{
        const {path}=req.body;
        let init=__dirname+"/public/"+path
        if (!fs.existsSync(init)) {
            console.error(`Old path file "${init}" does not exist`);
            return res.status(404).send("Old path file does not exist");
        }else{
            fs.unlink(init,(err)=>{
                if (err) {
                    console.error(err);
                    res.status(500).json({ error: 'Error deleting file' });
                  } else {
                    res.json({ message: 'File deleted successfully' });
                  }
            })
        }
    })
    
    app.get('/searchI',async(req,res)=>{
        const {path}=req.query;
        let init=__dirname+"/public/"+path
        console.log("Searching for image at path:", init)
        if (!fs.existsSync(init)) {
            console.error(`File Does not Exist`);
            return res.status(404).send({error:"Old path file does not exist"});
        }else{
            console.log("Found it!")
            res.status(200).send({ message: "Image found" })
        }
    })
    
    const isAdmin=(req,res,next)=>{
        try{
            if(req.url.toLowerCase().includes('/admin')){
                const ID=req.cookies.admin;
                console.log(ID+" accessing "+req.url)
                if(!ID){
                    return res.status(403).send('Forbidden: Access Denied');
                }
            }
            next()
        }catch(err){
            console.log(err);
        return res.status(500).send('Internal Server Error')}
    }
    
    //app.use(isAdmin)
    
    const nodemailer = require("nodemailer");
    
    //#region Email Functions
    
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "notificationbot001@gmail.com",
        pass: "vevd imaa e g k i tpwg"
      }
      
    });
    
    app.post('/verifyNotif',async(req,res)=>{
        const {uID,uName,uEmail}=req.body;
        const link=`http://localhost:8080/verifyU?uID=${uID}&uEmail=${uEmail}`;
        console.log('Get Ready For: ',req.body)
        try{
          const info=await transporter.sendMail({
            from: '"PICTO EXAM APP" <notificationbot001@gmail.com>',
              to: `${uEmail}`,
              subject: "PICTO EXAM APP USER VERIFICATION",
              html: `
              <h1>PROVINCIAL INFORMATION AND COMMUNICATIONS TECHNOLOGY OFFICE</h1>
              <h2>--------------------------------</h2>
              <em>Good Day, ${uName}. Thank you for signing up for our Website! Enclosed is the link to verify your account. Please click it to activate your account so you can start taking our exam for your application!
              <br>
              <a style="border: 2px solid black; background-color:blue;color:black;font-size:24px;border-radius: 5px;" href="${link}">Verify account</a>
              <br></em>
              `
          })
          console.log("Message sent: %s", info.messageId);
          res.json({ message: 'Email sent successfully' });
        }
        catch(err){
          console.error(err)
          res.status(500).json({message:'Email failed to send.'})
        }
      })
    
      app.get('/verifyU',async(req,res)=>{
        const {uID,uEmail}=req.query;
        console.log('Get Ready For:',req.query);
      try{
        conn.getConnection((err,connection)=>{
            if (err) {
                console.error('Error connecting to database:', err);
                return res.status(500).json({ error: "Database is NOT ready" });
            }
            connection.release();
        })
            const uStat="Verified"
            const updootQ={uID};
            const dt=new Date();
            dt.setDate(dt.getDate())
            const set={uStat:uStat,uExamSched:dt}
            let e=conn.query(`UPDATE user SET ? WHERE uID='${uID}'`,[set],(error,result)=>{
                if(error)throw error
                console.log("Checking");
            if(result.affectedRows > 0){
                console.log("Updated!")
                res.render('verified',{dat:uID})
            }
            });
      }catch(err){
        console.error('Error updating document:', err);
      }
      });
    
      app.post('/AuthentifyNotifU',async(req,res)=>{
        const {Name,Email}=req.body;
        console.log('Get Ready For: ',req.body)
        function rollNum(){
            var randNum=Math.floor(Math.random()*9)
            return randNum
        }
        function rollLetter(){
            var letter=String.fromCharCode(65+(Math.floor(Math.random()*26)))
            return letter
        }
        
        function coinFlip(){
            var coin=Math.floor(Math.random()*2)
            return coin
        }
        let generatedCode=""
        function pull(){
            for(i=0;i<=4;i++){
            let HoT=coinFlip()
                if(HoT==1){
                generatedCode+=rollLetter()
                }else{
                generatedCode+=rollNum()
                }
            }
            return generatedCode
        }
        let authCode=pull();
        try{
          const info=await transporter.sendMail({
            from: '"PICTO EXAM APP" <notificationbot001@gmail.com>',
              to: `${Email}`,
              subject: "PICTO EXAM APP USER AUTHENTICATION",
              html: `
              <h1>PROVINCIAL INFORMATION AND COMMUNICATIONS TECHNOLOGY OFFICE</h1>
              <h2>--------------------------------</h2>
              <em>Good Day, ${Name}.<br>
              Enclosed is the Code you should be inputting to continue to your Userpage.
              <br>
              ${authCode}
              <br></em>
              `
          })
          console.log("Message sent: %s", info.messageId);
          res.json({ message: 'Email sent successfully',authCode});
        }
        catch(err){
          console.error(err)
          res.status(500).json({message:'Email failed to send.'})
        }
      })
    
      app.post('/forgotNotif',async(req,res)=>{
        const {uID,uName,uEmail}=req.body;
        const link=`http://localhost:8080/resetP?uID=${uID}&uEmail=${uEmail}`;
        console.log('Get Ready For: ',req.body)
        try{
          const info=await transporter.sendMail({
            from: '"PICTO EXAM APP" <notificationbot001@gmail.com>',
              to: `${uEmail}`,
              subject: "PICTO EXAM APPLICATION PASSWORD RECOVERY LINK",
              html: `
              <h1>PROVINCIAL INFORMATION AND COMMUNICATIONS TECHNOLOGY OFFICE</h1>
              <h2>--------------------------------</h2>
              <em>Good Day, ${uName}.<br>
              We heard you were having trouble with your account. Enclosed is a link to a page where you could set your password.
              <br>
              <a style="border: 2px solid black; background-color:blue;font-size:24px;border-radius: 5px;color:black;" href="${link}">Change Password</a>
              <br></em>
              `
          })
          console.log("Message sent: %s", info.messageId);
          res.json({ message: 'Email sent successfully' });
        }
        catch(err){
          console.error(err)
          res.status(500).json({message:'Email failed to send.'})
        }
      })
    
      app.get('/resetP',async(req,res)=>{
        const {uID,uEmail}=req.query
        console.log(req.query)
        try{
            conn.getConnection((err,connection)=>{
                if (err) {
                    console.error('Error connecting to database:', err);
                    return res.status(500).json({ error: "Database is NOT ready" });
                }
                connection.release();
            })
                conn.query(`SELECT * FROM user WHERE uID='${uID}'`,(err,rows)=>{
                    if(err){
                    console.error('ERROR FETCHING DATA:',err)
                    res.status(500).send('Internal Server Error')
                    
                }
                console.log('Document update Authorized');
                res.render('forgorPass',{dat:rows})
            })
            
      }catch(err){
        console.error('Error updating document:', err);
        }
    });
    
    app.post('/remindNotif',async(req,res)=>{
        const {uName,uEmail,uExamSched}=req.body;
        console.log('Get Ready For: ',req.body)
        try{
          const info=await transporter.sendMail({
            from: '"PICTO EXAM APP" <notificationbot001@gmail.com>',
              to: `${uEmail}`,
              subject: "PICTO EXAM REMINDER",
              html: `
              <h1>PROVINCIAL INFORMATION AND COMMUNICATIONS TECHNOLOGY OFFICE</h1>
              <h2>--------------------------------</h2>
              <em>Good Day, ${uName}.<br>
              We are emailing to remind you about your untaken exam for your application to work with us. Please answer it ${uExamSched}.
              <br>
              Thank you and have a nice day. :]
              <br></em>
              `
          })
          console.log("Message sent: %s", info.messageId);
          res.json({ message: 'Email sent successfully' });
        }
        catch(err){
          console.error(err)
          res.status(500).json({message:'Email failed to send.'})
        }
      })

app.use(exp.static(path.join(__dirname,'public')))

//#region ejs foundation
app.get('/',async(req,res)=>{
    res.render('homepage')
});


app.get('/login',async(req,res)=>{
    res.render('login')
})

app.get('/registration',async(req,res)=>{
    res.render('register')
})

app.get('/forgot',async(req,res)=>{
    res.render('forgorSend')
})

app.get('/authenticate/user',async(req,res)=>{
    res.render('authentifyU')
})

app.get('/authenticate/admin',async(req,res)=>{
    res.render('authentifyA')
})

app.get('/user/',async(req,res)=>{
    const uID=req.cookies.user
    try {
        conn.query(`SELECT * FROM user WHERE uID='${uID}'`,(err,rows)=>{if(err){
            console.error('ERROR FETCHING DATA:',err)
            res.status(500).send('Internal Server Error')
        }
        res.render('userpage',{dat:rows})
    })
        
      } catch (err) {
        console.error('Something went wrong fetching the data', err);
        res.status(500).send('Internal Server Error');
      }
    
})

app.get('/user/exam',async(req,res)=>{
    res.render('exam')
})

app.get('/admin/',async(req,res)=>{
    let dat1,dat2
    try {
        conn.query('SELECT * FROM user ORDER BY uExamSched DESC',(err,rows)=>{if(err){
            console.error('ERROR FETCHING DATA:',err)
            res.status(500).send('Internal Server Error')
        }
        res.render('admin',{dat:rows})
        })
        
      } catch (err) {
        console.error('Something went wrong fetching the data', err);
        res.status(500).send('Internal Server Error');
      }
})

app.get('/admin/exam',async(req,res)=>{
    res.render('adminExam')
})

app.get('/admin/applicants',async(req,res)=>{
    res.render('adminApplicant')
})

app.get('/admin/users',async(req,res)=>{
    res.render('adminUsers')
})

app.get('/admin/audit',async(req,res)=>{
    try {
        let e=conn.query('SELECT * FROM log ORDER BY logDate DESC',(err,rows)=>{if(err){
            console.error('ERROR FETCHING DATA:',err)
            res.status(500).send('Internal Server Error')
        }
        res.render('adminLog',{dat:rows})
        
    })
      } catch (err) {
        console.error('Something went wrong fetching the data', err);
        res.status(500).send('Internal Server Error');
      }
})
//#endregion

//#region user table and functions

app.get('/user-data', async (req, res) => {
    try {
      let q=conn.query('SELECT * FROM user ORDER BY uExamSched DESC',(err,results)=>{
        if(err)throw err;
        res.json(results)
      })
    } catch (err) {
      console.error('Something went wrong fetching the data from MySQL', err);
      res.status(500).send('Internal Server Error');
    }
  });

  app.get('/searchUser', async (req, res) => {
    const { uID } = req.query;
    console.log(req.query);
    try {
        conn.getConnection((err,connection)=>{
            if (err) {
                console.error('Error connecting to database:', err);
                return res.status(500).json({ error: "Database is NOT ready" });
            }
            connection.release();
        })
        
        conn.query(`SELECT * FROM user WHERE uID='${uID}'`,(error,result)=>{
            console.log("Checking");
        if (result.length > 0) { 
            console.log("Found it");
            res.status(200).json(result); 
        } else {
            console.log('Record Not Found with that ID.');
            res.status(404).json({ error: 'Record not found' });
        }
        }); 
        
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'An error occurred while fetching the user' });
    }
});

app.get('/searchCurrentUser', async (req, res) => {
    const uID = req.cookies.user;
    console.log("Looking For:");
    try {
        conn.getConnection((err,connection)=>{
            if (err) {
                console.error('Error connecting to database:', err);
                return res.status(500).json({ error: "Database is NOT ready" });
            }
            connection.release();
        })
        
        conn.query(`SELECT * FROM user WHERE uID='${uID}'`,(error,result)=>{
            if(error)throw error
            console.log("Checking");
        if (result.length > 0) { 
            console.log("Found it");
            res.status(200).json(result); 
        } else {
            console.log('Record Not Found with that ID.');
            res.status(404).json({ error: 'Record not found' });
        }
        }); 
        
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'An error occurred while fetching the user' });
    }
});

app.post('/insertUser',async(req,res)=>{
    const {uID,uName,uEmail,uPass,uGender,uPhoNo,uType,uClass,uExamStat,uExamAns,uExamCheck,uExamScore,uStat,uExamSched,uDateCreated}=req.body
    console.log("Inserting:")
    console.log(req.body)
    try{
        conn.getConnection((err,connection)=>{
            if (err) {
                console.error('Error connecting to database:', err);
                return res.status(500).json({ error: "Database is NOT ready" });
            }
            connection.release();
        })
        let body={uID:uID,uName:uName,uEmail:uEmail,uPass:uPass,uGender:uGender,uPhoNo:uPhoNo,uType:uType,uClass:uClass,uExamStat:uExamStat,uExamAns:uExamAns,uExamCheck:uExamCheck,uExamScore:uExamScore,uStat:uStat,uExamSched:uExamSched,uDateCreated:uDateCreated}
        let e=conn.query(`INSERT INTO user SET ?`,body,(error,result)=>{
            if(error)throw error
            console.log("Inserting");
        if(result.affectedRows > 0){
            console.log("Inserted!")
            res.status(201).json({message:'Record Inserted'})
        }
        });
    }catch(err){
          console.error('E-E-ERROR! ',err);
        res.status(500).json({ error: 'An error occurred while inserting the record.' });
        
    }
})

    app.patch('/updateUser',async(req,res)=>{
        const {uID,uIDnu,uName,uEmail,uPass,uGender,uPhoNo,uType,uClass,uExamStat,uExamAns,uExamCheck,uExamCheckVal,uExamScore,uExamPoints,uStat,uExamSched,uDateCreated}=req.body
    console.log("Uptating:")
    console.log(req.body)
    try{
        conn.getConnection((err,connection)=>{
            if (err) {
                console.error('Error connecting to database:', err);
                return res.status(500).json({ error: "Database is NOT ready" });
            }
            connection.release();
        })
        let ID=uID
        let set={}
        if(uIDnu)set.uID=uIDnu
        if(uName)set.uName=uName
        if(uEmail)set.uEmail=uEmail
        if(uPass)set.uPass=uPass
        if(uGender)set.uGender=uGender
        if(uPhoNo)set.uPhoNo=uPhoNo
        if(uType)set.uType=uType
        if(uClass)set.uClass=uClass
        if(uExamStat)set.uExamStat=uExamStat
        if(uExamAns)set.uExamAns=JSON.stringify(uExamAns)
        if(uExamCheck)set.uExamCheck=JSON.stringify(uExamCheck)
        if(uExamCheckVal)set.uExamCheckVal=JSON.stringify(uExamCheckVal)
        if(uExamScore)set.uExamScore=uExamScore
        if(uExamPoints)set.uExamPoints=uExamPoints
        if(uStat)set.uStat=uStat
        if(uExamSched)set.uExamSched=uExamSched
        if(uDateCreated)set.uDateCreated=uDateCreated
        conn.query(`UPDATE user SET ? WHERE uID='${ID}'`,[set],(error,result)=>{
            if(error)throw error
            console.log("Checking");
        console.log(result);
        if(result.affectedRows > 0){
            console.log("Updated!")
            res.status(201).json({message:'Record updated'})
        }
        });
    }catch(err){
        console.log("Something went wrong: ",err)
        res.status(500).json({ error: 'An error occurred while inserting the record.' });
    }
    })
    app.post('/deleteUser', async (req, res) => {
        const { uID } = req.body;
        console.log(req.query);
        console.log(uID);
    
        try {
            conn.getConnection((err,connection)=>{
                if (err) {
                    console.error('Error connecting to database:', err);
                    return res.status(500).json({ error: "Database is NOT ready" });
                }
                connection.release();
            })
            conn.query(`DELETE FROM user WHERE uID='${uID}'`,(error,result)=>{
                console.log("Checking");
            console.log(result);
            if (result.affectedRows > 0) { 
                console.log("Found it");
                res.status(200).json(result); 
            } else {
                console.log('Record Not Found with that ID.');
                res.status(404).json({ error: 'Record not found' });
            }
            }); 
            
        } catch (err) {
            console.error('Error fetching user:', err);
            res.status(500).json({ error: 'An error occurred while fetching the user' });
        }
    });
//#endregion

//#region admin data + functions
app.get('/admin-data', async (req, res) => {
    try {
      let q=conn.query('SELECT * FROM admin',(err,results)=>{
        if(err)throw err;
        res.json(results)
      })
    } catch (err) {
      console.error('Something went wrong fetching the data from MySQL', err);
      res.status(500).send('Internal Server Error');
    }
  });

  app.get('/searchAdmin', async (req, res) => {
    const { aID } = req.query;
    console.log(req.query);
    console.log(aID);

    try {
        conn.getConnection((err,connection)=>{
            if (err) {
                console.error('Error connecting to database:', err);
                return res.status(500).json({ error: "Database is NOT ready" });
            }
            connection.release();
        })
        conn.query(`SELECT * FROM admin WHERE aID='${aID}'`,(error,result)=>{
            if(error)throw error
            console.log("Checking");
        if (result.length > 0) { 
            console.log("Found it");
            res.status(200).json(result); 
        } else {
            console.log('Record Not Found with that ID.');
            res.status(404).json({ error: 'Record not found' });
        }
        }); 
        
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'An error occurred while fetching the user' });
    }
});

app.get('/searchCurrentAdmin', async (req, res) => {
    const aID  = req.cookies.admin;
    try {
        conn.getConnection((err,connection)=>{
            if (err) {
                console.error('Error connecting to database:', err);
                return res.status(500).json({ error: "Database is NOT ready" });
            }
            connection.release();
        })
        conn.query(`SELECT * FROM admin WHERE aID='${aID}'`,(error,result)=>{
            if(error)throw error
            console.log("Checking");
        if (result.length > 0) { 
            console.log("Found it");
            res.status(200).json(result); 
        } else {
            console.log('Record Not Found with that ID.');
            res.status(404).json({ error: 'Record not found' });
        }
        }); 
        
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'An error occurred while fetching the user' });
    }
});

app.post('/insertAdmin',async(req,res)=>{
    const {aID,aName,aPhoNo,aEmail,aPass,aClass}=req.body
    console.log("Inserting:")
    console.log(req.body)
    try{
        conn.getConnection((err,connection)=>{
            if (err) {
                console.error('Error connecting to database:', err);
                return res.status(500).json({ error: "Database is NOT ready" });
            }
            connection.release();
        })
        let body={aID:aID,aName:aName,aPhoNo:aPhoNo,aEmail:aEmail,aPass:aPass,aClass:aClass}
        let e=conn.query(`INSERT INTO admin SET ?`,body,(error,result)=>{
            if(error)throw error
            console.log("Inserting");
        if(result.affectedRows > 0){
            console.log("Inserted!")
            res.status(201).json({message:'Record Inserted'})
        }
        });
    }catch(err){
          console.error('E-E-ERROR! ',err);
        res.status(500).json({ error: 'An error occurred while inserting the record.' });
        
    }
})

    app.patch('/updateAdmin',async(req,res)=>{
    const {aID,aIDnu,aName,aPhoNo,aEmail,aPass,aClass}=req.body=req.body
    console.log("Uptating:")
    console.log(req.body)
    try{
        conn.getConnection((err,connection)=>{
            if (err) {
                console.error('Error connecting to database:', err);
                return res.status(500).json({ error: "Database is NOT ready" });
            }
            connection.release();
        })
        let ID=aID
        let set={}
        if(aIDnu)set.aID=aIDnu
        if(aName)set.aName=aName
        if(aEmail)set.aEmail=aEmail
        if(aPass)set.aPass=aPass
        if(aPhoNo)set.aPhoNo=aPhoNo
        if(aClass)set.aClass=aClass
        conn.query(`UPDATE admin SET ? WHERE aID='${ID}'`,[set],(error,result)=>{
            if(error)throw error
            console.log("Updating");
        if(result.affectedRows > 0){
            console.log("Updated!")
            res.status(201).json({message:'Record Updated'})
        }
        });
    }catch(err){
        console.log("Something went wrong: ",err)
        res.status(500).json({ error: 'An error occurred while inserting the record.' });
    }
    })
    app.post('/deleteAdmin', async (req, res) => {
        const { aID } = req.body;
        console.log("Say Bye For:");
        console.log(aID);
    
        try {
            if (!conn) {
                console.log("No Connection.");
                return res.status(500).json({ error: "Database is NOT ready" });
            }
            conn.query(`DELETE FROM admin WHERE aID='${aID}'`,(error,result)=>{
                if(error)throw error
                console.log("Checking");
            if (result.affectedRows > 0) { 
                console.log("Found it");
                res.status(200).json(result); 
            } else {
                console.log('Record Not Found with that ID.');
                res.status(404).json({ error: 'Record not found' });
            }
            }); 
            
        } catch (err) {
            console.error('Error fetching user:', err);
            res.status(500).json({ error: 'An error occurred while fetching the user' });
        }
    });
//#endregion

//#region exam data + functions
app.get('/exam-data', async (req, res) => {
    try {
      let q=conn.query('SELECT * FROM exam',(err,results)=>{
        if(err)throw err;
        res.json(results)
      })
    } catch (err) {
      console.error('Something went wrong fetching the data from MySQL', err);
      res.status(500).send('Internal Server Error');
    }
  });

  app.get('/searchExam', async (req, res) => {
    const { examID } = req.query;
    console.log(examID);
    try {
        if (!conn) {
            console.log("No Connection.");
            return res.status(500).json({ error: "Database is NOT ready" });
        }
       let e= conn.query(`SELECT * FROM exam WHERE examID LIKE '%${examID}%'`,(error,result)=>{
        if(error)throw error
        console.log("Checking");
    if (result.length > 0) { 
        console.log("Found it");
        res.status(200).json(result); 
    } else {
        console.log('Record Not Found with that ID.');
        res.status(404).json({ error: 'Record not found' });
    }
    });
    console.log(e) 
        
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'An error occurred while fetching the user' });
    }
});

app.post('/insertExam',async(req,res)=>{
    const {examID,examQ,examAns,examDateAdd,examVal,examClass,examImg}=req.body
    const examUserAdd=req.cookies.admin
    console.log("Inserting:")
    console.log(req.body)
    let examQq=examQ.question
    let examQa=examQ.choices
    try{
        let body={examID:examID,examQ:JSON.stringify({question:examQq,choices:examQa}),examAns:examAns,examDateAdd:examDateAdd,examUserAdd:examUserAdd,examVal:examVal,examClass:examClass,examImg:JSON.stringify(examImg)}
        let e=conn.query(`INSERT INTO exam SET ?`,body,(error,result)=>{
            if(error)throw error
            console.log("Inserting");
        if(result.affectedRows > 0){
            console.log("Inserted!")
            res.status(201).json({message:'Record Inserted'})
        }
        });
    }catch(err){
          console.error('E-E-ERROR! ',err);
        res.status(500).json({ error: 'An error occurred while inserting the record.' });
        
    }
})

    app.patch('/updateExam',async(req,res)=>{
        const {examIDnu,examID,examQ,examAns,examDateAdd,examVal,examClass,examImg}=req.body
        const examUserAdd=req.cookies.admin
    console.log("Uptating:")
    console.log(req.body)
    try{
        console.log(JSON.stringify(examQ))
        let ID=examID
        let set={examUserAdd:examUserAdd}
        if(examIDnu)set.examID=examIDnu
        if(examQ)set.examQ=JSON.stringify(examQ)
        if(examAns)set.examAns=examAns
        if(examDateAdd)set.examDateAdd=examDateAdd
        if(examVal)set.examVal=examVal
        if(examClass)set.examClass=examClass
        if(examImg)set.examImg=JSON.stringify(examImg)
        let e=conn.query(`UPDATE exam SET ? WHERE examID='${ID}'`,[set],(error,result)=>{
            if(error)throw error
            console.log("Updating");
        if(result.affectedRows > 0){
            console.log("Updated!")
            res.status(201).json({message:'Record Updated'})
        }
        });
    }catch(err){
        console.log("Something went wrong: ",err)
        res.status(500).json({ error: 'An error occurred while inserting the record.' },err);
    }
    })
    app.post('/deleteExam', async (req, res) => {
        const { examID } = req.body;
        console.log("Deleting");
        console.log(examID);
        try {
            if (!conn) {
                console.log("No Connection.");
                return res.status(500).json({ error: "Database is NOT ready" });
            }
            conn.query(`DELETE FROM exam WHERE examID='${examID}'`,(error,result)=>{
                if(error)throw error
                console.log("Checking");
            console.log(result);
            if (result.affectedRows > 0) { 
                console.log("Found it");
                res.status(200).json(result); 
            } else {
                console.log('Record Not Found with that ID.');
                res.status(404).json({ error: 'Record not found' });
            }
            }); 
            
        } catch (err) {
            console.error('Error fetching user:', err);
            res.status(500).json({ error: 'An error occurred while fetching the user' });
        }
    });

    //#endregion

    //#region log table commands
    app.get('/log-data', async (req, res) => {
        try {
          let q=conn.query('SELECT * FROM log ORDER BY logDate ASC',(err,results)=>{
            if(err)throw err;
            res.json(results)
          })
        } catch (err) {
          console.error('Something went wrong fetching the data from MySQL', err);
          res.status(500).send('Internal Server Error');
        }
      });

      app.post('/insertLog',async(req,res)=>{
        const {logID,logMssg,logDate,logType,logUser}=req.body
        let userType,userName
        
        console.log("Inserting:")
        try{
            if(req.cookies.admin){
                userType="ADMIN"
                userName=req.cookies.adminName
            }else if(req.cookies.user){
                userType="USER"
                userName=req.cookies.userName
            }else if(logUser!=undefined){
                userName=""
                userType=logUser
            }else{
                console.log("NO LOG")
                return res.status(201).json({message:'No Record'})
            }
            let fullMssg=userName+" "+logMssg
            let body={logID:logID,logMssg:fullMssg,logDate:logDate,logUser:userType,logType:logType}
            let e=conn.query(`INSERT INTO log SET ?`,body,(error,result)=>{
                if(error)throw error
                console.log("Checking");
            if(result.affectedRows > 0){
                console.log("Inserted!")
                res.status(201).json({message:'Record Inserted'})
            }
            });
        }catch(err){
              console.error('E-E-ERROR! ',err);
            res.status(500).json({ error: 'An error occurred while inserting the record.' });
        }
    })

    app.post('/deleteLog', async (req, res) => {
        const {logID}=req.body
        console.log("Deleting");
        console.log(logID)
        try {
            if (!conn) {
                console.log("No Connection.");
                return res.status(500).json({ error: "Database is NOT ready" });
            }
            conn.query(`DELETE FROM log WHERE logID='${logID}'`,(error,result)=>{
                if(error)throw error
                console.log("Checking");
            console.log(result);
            if (result.affectedRows > 0) { 
                console.log("Deleted");
                res.status(200).json(result); 
            } else {
                console.log('Record Not Found with that ID.');
                res.status(404).json({ error: 'Record not found' });
            }
            }); 
            
        } catch (err) {
            console.error('Error fetching user:', err);
            res.status(500).json({ error: 'An error occurred while fetching the user' });
        }
    });
    
    app.post('/deleteLogAll', async (req, res) => {
        console.log("Deleting: ALL");
        try {
            if (!conn) {
                console.log("No Connection.");
                return res.status(500).json({ error: "Database is NOT ready" });
            }
            conn.query(`DELETE FROM log`,(error,result)=>{
                if(error)throw error
                console.log("Checking");
            console.log(result);
            if (result.affectedRows > 0) { 
                console.log("Deleted");
                res.status(200).json(result); 
            } else {
                console.log('Record Not Found with that ID.');
                res.status(404).json({ error: 'Record not found' });
            }
            }); 
            
        } catch (err) {
            console.error('Error fetching user:', err);
            res.status(500).json({ error: 'An error occurred while fetching the user' });
        }
    });
    //#endregion

    //#region Login Commands
    app.post('/loginU',async(req,res)=>{
        const { uID,uPass } = req.body;
    console.log("Get Ready For:");
    console.log(req.body);
    try {
        conn.getConnection((err,connection)=>{
            if (err) {
                console.error('Error connecting to database:', err);
                return res.status(500).json({ error: "Database is NOT ready" });
            }
            connection.release();
        })
        
        conn.query(`SELECT * FROM user WHERE uID='${uID}'`,(error,result)=>{
            if(error)throw error
            console.log("Checking");
        if (result.length > 0) { 
           if(result[0].uPass==uPass){
            res.cookie('user',uID)
            res.cookie('userName',result[0].uName)
            res.status(200).json({ success: true,data:result});
           }
        } else {
            console.log('Record Not Found with that ID.');
            res.status(404).json({ error: 'Record not found' });
        }
        }); 
        
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'An error occurred while fetching the user' });
    }
    })

    app.post('/loginA',async(req,res)=>{
        const { aID,aPass } = req.body;
    console.log("Get Ready For:");
    console.log(req.body);
    try {
        conn.getConnection((err,connection)=>{
            if (err) {
                console.error('Error connecting to database:', err);
                return res.status(500).json({ error: "Database is NOT ready" });
            }
            connection.release();
        })
        
        conn.query(`SELECT * FROM admin WHERE aID='${aID}'`,(error,result)=>{
            if(error)throw error
            console.log("Checking");
        if (result.length > 0) { 
            console.log(result[0].aPass)
           if(result[0].aPass==aPass){
            res.cookie('admin',aID)
            res.cookie('adminName',result[0].aName)
            res.status(200).json({ success: true});
           }
        } else {
            console.log('Record Not Found with that ID.');
            res.status(404).json({ error: 'Record not found' });
        }
        }); 
        
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'An error occurred while fetching the user' });
    }
    })
    app.get('/logout',async(req,res)=>{
        res.clearCookie('user')
        res.clearCookie('userName')
        res.clearCookie('admin')
        res.clearCookie('adminName')
        res.json({message:"Cookies cleared"})
    })

    
//#endregion 

