using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using myhttpd;
using SimpleHttpServer.Models;
using utility;
using System.Threading;
namespace _100wCSVPost
{
    public partial class Form1 : Form
    {
        private myinclude my = new myinclude();
        private HttpServer HS = null;
        private Thread thread = null;
        public Form1()
        {
            InitializeComponent();
        }
        private static HttpResponse runAddBrowseLog(HttpRequest request)
        {
            // request 是來的資料
            //Console.WriteLine(request.Content);

            var response = new HttpResponse();
            response.StatusCode = "200";
            //response.ReasonPhrase = "Ok";
            response.ContentAsUTF8 = "{\"Status\": true,\"Message\":\"成功\"}";
            response.Headers["Content-Type"] = "application/json; charset=utf-8";
            return response;
            /*
            return new HttpResponse()
            {
                ContentAsUTF8 = "{\"Status\": true,\"Message\":\"成功\"}",
                ReasonPhrase = "OK",
                Headers["Content-Type"] = "",
                StatusCode = "200"
            };
            */
        }
        private void runBtn_Click(object sender, EventArgs e)
        {
            if (!my.is_numeric(portText.Text))
            {
                MessageBox.Show("只能填數字...且不能與本機 Port 重複...");
                return;
            }
            int port = Convert.ToInt32(portText.Text);
            //List<Route> works = new List<Route>();




            switch (runBtn.Text)
            {
                case "啟動":
                    {
                        runBtn.Text = "暫停";
                        portText.Enabled = false;
                        runBtn.ForeColor = Color.Red;
                        thread = new Thread(() =>
                        {
                            HS = new HttpServer(port);

                            //註冊服務的工作
                            //From : https://github.com/jeske/SimpleHttpServer/blob/master/SimpleHttpServer.WebApp/Routes.cs
                            List<Route> works = new List<Route>();
                            works.Add(new Route()
                            {
                                Name = "AddBrowseLog",
                                UrlRegex = "\\/API\\/Default\\/AddBrowseLog",
                                Method = "POST",
                                Callable = runAddBrowseLog
                            });
                            for (int i = 0, max_i = works.Count(); i < max_i; i++)
                            {
                                HS.AddRoute(works[i]);
                            }



                            HS.Run();
                        });
                        thread.Start();
                    }
                    break;
                case "暫停":
                    {

                        HS.Stop();
                        thread.Abort();
                        thread = null;
                        runBtn.Text = "啟動";
                        portText.Enabled = true;
                        runBtn.ForeColor = Color.Green;
                    }
                    break;
            }
        }
    }
}
