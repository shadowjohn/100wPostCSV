const polka = require('polka');
const bodyParser = require('body-parser')
const multer  = require('multer')
const upload = multer()
const F_data = {}; //記憶體放結果
polka()  
  .post('/Api/Default/AddBrowseLog',upload.array(), (req, res) => {    	
    const BL_UID = req.body.BL_UID;    
    const BL_TIME = req.body.BL_TIME.substr(0,10);
    if(F_data[BL_UID]==null)
    {
      F_data[BL_UID] = {};
    }
    if(F_data[BL_UID][BL_TIME]==null)
    {
      F_data[BL_UID][BL_TIME] = 0;
    }
    else
    {
	  ++F_data[BL_UID][BL_TIME];
	}	
	res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8' });	
    res.end("{\"Status\":true,\"Message\":\"成功\"}");//{'status':'OK'});//User: ${req.params.id}`);
  })
  .get('/API/Default/GetBrowseLog', function (req, res) {    
    res.end(JSON.stringify(F_data))
  })  
  .post('/API/Default/GetBrowseLog',bodyParser.urlencoded({ extended: false }),(req, res) => {  
    console.log(req.body);
    const BL_UID = req.body.BL_UID;
	const BL_TIME_S = req.body.BL_TIME_S;
	const BL_TIME_E = req.body.BL_TIME_E;
	const output = {
		"Status":true,
		"Message":"成功",
		"Data":[]
	};
	//最後將錯的日期格式，如 24/2/2022 -> 2022-02-24
	//查 BL_TIME_S ~ BL_TIME_E
	if(BL_TIME_S=="BL_TIME_S") // 你測到標題了，笑死
	{
		res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8' });	
		res.end("{\"Status\":false,\"Message\":\"失敗，你測到標題了，笑死\"}");
		return;
	}
	if(F_data[BL_UID]!=null)
	{
		//修正可能的日期錯誤，如 24/2/2022 -> 2022-02-24
		for(let dt in F_data[BL_UID])
		{
			if(dt=="BL_TIME") {
				delete F_data[BL_UID][dt];
				continue; //是標題，也被匯了
			}
			let m = dt.split("/");
			//切10個字時，有可能是 "1/1/2022 x"
			if(m.length==3 && m[2].split(" ").length==2) {
				m[2] = m[2].split(" ")[0];
				let tmp = m[0].trim();
				m[0]=m[2].trim();
				m[2]=tmp;
				//console.log(m);
				//console.log(m.join("-"));
				F_data[BL_UID][new Date(m.join("-")).toISOString().substring(0,10)] = F_data[BL_UID][dt];
				delete F_data[BL_UID][dt];				
			}
			else if(m.length==3 && m[0].length<=2) //24/2/2022
			{
				let tmp = m[0].trim();
				m[0]=m[2].trim();
				m[2]=tmp;
				//console.log(m);
				//console.log(m.join("-"));
				F_data[BL_UID][new Date(m.join("-")).toISOString().substring(0,10)] = F_data[BL_UID][dt];
				delete F_data[BL_UID][dt];
				//console.log(F_data[BL_UID]);
			}
			else if(m.length==3 && m[0].length==4) // 2022/xx/xx
			{
				//還是要處理，把 / 改 -
				F_data[BL_UID][new Date(dt).toISOString().substring(0,10)] = F_data[BL_UID][dt];
				delete F_data[BL_UID][dt];
				//console.log(F_data[BL_UID]);
			}
		}
		//整理完成了
		//console.log("整理完成了");
		//console.log(F_data[BL_UID]);
		//接下來組資料
		//在 output["Data"] push 資料
		for(let s = new Date(BL_TIME_S).getTime()/1000;s<=new Date(BL_TIME_E).getTime()/1000;s+=24*60*60)
		{		
			let dt = new Date(s*1000).toISOString().substring(0,10);
			//console.log(dt);
			if(F_data[BL_UID][dt]==null) continue; //沒這日
			
			let d = {
				"BL_UID": BL_UID,
				"TIME": dt,
				"count": F_data[BL_UID][dt]
			};
			output["Data"].push(d);			
		}
	}
	
	res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8' });	
    res.end(JSON.stringify(output))
  })
  .listen(8888, () => {
    console.log(`> Running on localhost:8888`);
  });