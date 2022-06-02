using SimpleHttpServer;
using SimpleHttpServer.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace myhttpd
{
    public class HttpServer
    {
        #region Fields

        private int Port = 8888; //default
        private TcpListener Listener = null;
        private HttpProcessor Processor;
        private bool IsActive = true;
        private Thread thread = null;
        private List<Route> routes = new List<Route>();
        #endregion
        static TcpClient sTcpClient;

        #region Public Methods
        public HttpServer(int port)
        {
            this.Port = port;            
        }
        public void AddRoute(Route route)
        {
            this.routes.Add(route);
        }
        public void RemoveAllRoute()
        {
            this.routes.Clear();
            this.routes = new List<Route>();
        }
        public void Run()
        {
            this.Listener = new TcpListener(IPAddress.Any, this.Port);
            this.Listener.Start();
            IsActive = true;
            this.Processor = new HttpProcessor();

            foreach (var route in routes)
            {
                this.Processor.AddRoute(route);
            }

            while (this.IsActive)
            {
                sTcpClient = this.Listener.AcceptTcpClient();
                thread = new Thread(() =>
                {
                    this.Processor.HandleClient(sTcpClient);
                });
                thread.Start();
                Thread.Sleep(0);
            }            
        }
        public void Stop()
        {
            IsActive = false;
            thread.Abort();
            thread = null;
            this.Listener.Stop();
            this.Listener = null;
        }
        #endregion

    }
}
