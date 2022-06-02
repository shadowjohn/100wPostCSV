# 100wPostCSV
GIS 中心小品，測試 100w 筆csv用http post匯入並查詢


1、請先安裝 node.js
2、進入此資料夾，執行
  
    npm install
    
將會安裝「polka、multer、body-parser」

3、啟動服務

    node server.js

	或安裝 npm install nodemon -g

	nodemon server.js
    
4、Server 會跑 127.0.0.1 , Port : 8888

5、測試服務
<ul>
	<li><s>/API/Default/AddBrowseLog   (POST 注意，需使用 multipart/form-data)</s></li>
	<li>/API/Default/AddBrowseLog   (POST x-www-form-urlencoded)</li>
	<li>/API/Default/GetBrowseLog   (POST x-www-form-urlencoded) </li>
</ul>        
