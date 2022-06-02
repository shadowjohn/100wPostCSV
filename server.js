const polka = require('polka');
const bodyParser = require('body-parser')
const JSON2 = require('JSON2');
//const multer  = require('multer')
//const upload = multer()
//upload.array()
const F_data = {}; //記憶體放結果
polka()
    .post('/API/Default/AddBrowseLog', bodyParser.urlencoded({ extended: false }), (req, res) => {
        const BL_UID = req.body.BL_UID;
        const BL_TIME = req.body.BL_TIME.substr(0, 10); //年月日在前面，反正都切10字，最後匯完再依查詢處理

        if (F_data[BL_UID] == null) {
            F_data[BL_UID] = {};
        }
        if (F_data[BL_UID][BL_TIME] == null) {
            F_data[BL_UID][BL_TIME] = 1;
        }
        else {
            ++F_data[BL_UID][BL_TIME];
        }
        res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8' });
        res.end("{\"Status\":true,\"Message\":\"成功\"}");//{'status':'OK'});//User: ${req.params.id}`);
    })
    .get('/API/Default/GetBrowseLog', function (req, res) {
        res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8' });
        res.end(JSON.stringify(F_data))
    })
    .post('/API/Default/GetBrowseLog', bodyParser.urlencoded({ extended: false }), (req, res) => {
        const BL_UID = req.body.BL_UID;
        const BL_TIME_S = req.body.BL_TIME_S;
        const BL_TIME_E = req.body.BL_TIME_E;
        const output = {
            "Status": true,
            "Message": "成功",
            "Data": []
        };
        //最後將錯的日期格式，如 24/2/2022 -> 2022-02-24
        //查 BL_TIME_S ~ BL_TIME_E
        if (BL_TIME_S == "BL_TIME_S") // 你測到標題了，笑死
        {
            res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8' });
            res.end("{\"Status\":false,\"Message\":\"失敗，你測到標題了，笑死\"}");
            return;
        }
        if (F_data[BL_UID] != null) {
            //修正可能的日期錯誤，如 24/2/2022 -> 2022-02-24
            for (const dt in F_data[BL_UID]) {
                if (dt == "BL_TIME") {
                    delete F_data[BL_UID][dt];
                    continue; //是標題，也被匯了
                }
                const m = dt.replace("/", "-").replace("T", " ").split(" ")[0].split("-");
                const new_dt = m[0] + '-' + m[1].padStart(2, '0') + '-' + m[2].padStart(2, '0'); //強轉型成 YYYY-mm-dd
                F_data[BL_UID][new_dt] = F_data[BL_UID][dt];
            }
            //整理完成了

            //接下來組資料
            //在 output["Data"] push 資料

            for (let s = new Date(BL_TIME_S).getTime() / 1000; s <= new Date(BL_TIME_E).getTime() / 1000; s += 24 * 60 * 60) {
                const dt = new Date(s * 1000).toISOString().substring(0, 10);

                if (F_data[BL_UID][dt] == null) continue; //沒這日

                const d = {
                    "BL_UID": BL_UID,
                    "TIME": dt,
                    "count": F_data[BL_UID][dt]
                };
                output["Data"].push(d);
            }
        }

        res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8' });
        res.end(JSON2.stringify(output));
    })
    .listen(8888, () => {
        console.log(`> Running on localhost:8888`);
    });