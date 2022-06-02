const polka = require('polka');
const bodyParser = require('body-parser')
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
        res.end("{\"Status\":true,\"Message\":\"成功\"}");
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
        if (new Date(BL_TIME_S) == "Invalid Date" || new Date(BL_TIME_E) == "Invalid Date") // 無法轉日期格式
        {
            res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8' });
            res.end("{\"Status\":false,\"Message\":\"失敗，BL_TIME_S 或 BL_TIME_E 轉換日期格式失敗\"}");
            return;
        }
        if (F_data[BL_UID] != null) {
            //修正可能的日期錯誤，如 24/2/2022 -> 2022-02-24
            for (const dt in F_data[BL_UID]) {
                if (dt == "BL_TIME") {
                    delete F_data[BL_UID][dt];
                    continue; //是標題，也被匯了
                }
                if (dt.match(/\d{4}-\d{2}-\d{2}/) != null) continue; //符合格式的 dt
                const m = dt.replaceAll("/", "-").replaceAll("T", " ").split(" ")[0].split("-"); //有可能 d/m/yyyy
                if (m.length != 3) {
                    //未知的日期格式，嘗試用 new Date 解，再解不掉就跳過
                    if (new Date(m.join("-")) == "Invalid Date") continue;                    
                    m = new Date(m.join("-")).toISOString().substr(0, 10).split("-"); //解的出來就轉成 YYYY-mm-dd
                }
                //如果 m[0] 長度小於 2 ，m[0] 與 m[2] 對調
                if (m[0].length <= 2) {
                    const tmp = m[0];
                    m[0] = m[2];
                    m[2] = tmp;
                }
                const new_dt = m[0] + '-' + m[1].padStart(2, '0') + '-' + m[2].padStart(2, '0'); //強轉型成 YYYY-mm-dd
                if (F_data[BL_UID][new_dt] == null) {
                    F_data[BL_UID][new_dt] = F_data[BL_UID][dt];
                } else {
                    F_data[BL_UID][new_dt] += F_data[BL_UID][dt];
                }
                delete F_data[BL_UID][dt];
            }
            //整理完成了

            //接下來組資料
            //在 output["Data"] push 資料
            for (let s = new Date(BL_TIME_S).getTime() / 1000, max_s = new Date(BL_TIME_E).getTime() / 1000; s < max_s; s += 24 * 60 * 60) {
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
        res.end(JSON.stringify(output));
    })
    .listen(8888, () => {
        console.log(`> Running on localhost:8888`);
    });