// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Microsoft.Azure.SignalR.Samples.ChatRoom
{
    using Microsoft.AspNetCore.SignalR;
    using System;
    using System.Threading;
    using System.IO;
    using System.Collections;
    using Newtonsoft.Json.Linq;
    using Newtonsoft.Json;
    using System.Timers;
    using System.Drawing;

    public class Chat : Hub
    {
        IHubContext<Chat> context;
        public Chat(IHubContext<Chat> context)
        {
            this.context = context;

        }

        private static System.Timers.Timer aTimer;
        
        private bool reset;
        private int ind;
        private float North, South, West, East;
        private JArray jarray;
        public void StartUpdate(int updateDuration, 
                                float North_, float East_, float South_, float West_)
        {
            Clients.All.SendAsync("echo", -1);

            North = North_;
            East = East_;
            South = South_;
            West = West_;
            ind = 0;
            reset = false;

            Console.WriteLine(updateDuration);
            string data = ProcessFile(".\\util\\london-aircraft.json"); 
            jarray = JArray.Parse(data);
            // jarray = (JArray)JsonConvert.DeserializeObject(data);
            // Console.WriteLine(jarray);
            Console.WriteLine("update duration {0}", updateDuration);
            SetTimer(updateDuration);
            
            
            // for (int i = 0; i < jarray.Count; i++)
            // {
            //     var json = jarray[i].ToString();
            //     Console.Write("i=");
            //     Console.WriteLine(i);
            //     Client.All.SendAsync("updateBoundRequest");
            //     // Clients.All.SendAsync("StartUpdate", i, json);
            //     Thread.Sleep(updateDuration);
            // }
        }

        private void SetTimer(int interval)
        {
            // Create a timer with a two second interval.
            aTimer = new System.Timers.Timer(interval);
            // Hook up the Elapsed event for the timer. 
            // aTimer.Elapsed += OnTimedEvent;
            int iii = 0;
            aTimer.Elapsed += (sender, e) => {
                Console.WriteLine("on time event...{0}", iii++);
                // Clients.All.SendAsync("echo", 888).Wait();
                context.Clients.All.SendAsync("echo", 777);
            };
            // aTimer.Elapsed += (sender, e) => OnTimedEvent(sender, e, Clients);
            // aTimer.Elapsed += new ElapsedEventHandler(OnTimedEvent);
            aTimer.AutoReset = true;
            aTimer.Enabled = true;
        }



        public void OnTimedEvent(Object source, ElapsedEventArgs e)
        {
            Console.WriteLine("on time event");
            Clients.All.SendAsync("echo", 888);
             OnTimedEventtt(source, e, Clients);
            // Console.WriteLine("The Elapsed event was raised at {0:HH:mm:ss.fff}",
                        //   e.SignalTime);
            // Clients.All.SendAsync("updateBoundRequest", -1);
            // UpdateBoundRequest(hub);
        }

        private void OnTimedEventtt(Object source, ElapsedEventArgs e, IHubCallerClients Clients)
        {
            Console.WriteLine("on time event");
            Clients.All.SendAsync("echo", 999);
            // Console.WriteLine("The Elapsed event was raised at {0:HH:mm:ss.fff}",
                        //   e.SignalTime);
            // Clients.All.SendAsync("updateBoundRequest", -1);
            // UpdateBoundRequest(hub);
        }

        public void UpdateBoundRequest() {
            Console.WriteLine("update bound request");
            // Clients.All.SendAsync("updateBoundRequest", -1);
            Clients.All.SendAsync("echo", 999);
        }

        public void UpdateBound(float North_, float East_, float South_, float West_) {
            North = North_;
            East = East_;
            South = South_;
            West = West_;
            
            // todo: send different client different data according to their bound
            var verifiedList = PreprocessAircraftList((JArray)jarray[ind++], North, East, South, West);
            var json = verifiedList.ToString();

            Clients.All.SendAsync("updateAircraft", -1, json);
        }

        public void Echo(string name, 
            float North_, float East_, float South_, float West_)
        {
            North = North_;
            East = East_;
            South = South_;
            West = West_;
            Console.WriteLine("Update bound");
        }


        // private void ProcessDirectory(string targetDirectory, int updateDuration) 
        // {
        //     // Process the list of files found in the directory.
        //     string [] fileEntries = Directory.GetFiles(targetDirectory);
        //     foreach(string fileName in fileEntries) {
        //         string contents = ProcessFile(fileName);
        //         Clients.All.SendAsync("broadcastMessage", fileName, contents);
        //         Console.WriteLine("sleep");
        //         Thread.Sep(updateDuration);
        //     }
        // }

        private string ProcessFile(string path) 
        {
            Console.WriteLine("Processed file '{0}'.", path);
            string contents = File.ReadAllText(path);
            return contents;
        }

        private bool IsLatValid(float lat) 
        {
            if (lat >= -90.0 && lat <= 90.0) 
                return true;

            return false;
        }

        private bool IsLongValid(float long_) 
        {
            if (long_ >= -180.0 && long_ <= 180.0) 
                return true;

            return false;
        }

        private bool IsInScreen(PointF pt) 
        {
            // is location valid
            if (!IsLatValid(pt.X) || !IsLongValid(pt.Y)) 
                return false;

            if (West < East)
                return pt.X < East && pt.X > West && pt.Y < North && pt.Y > South;

            // it crosses the date line
            return (pt.X < East || pt.X > West) && pt.Y < North && pt.Y > South;    

        }

        private JArray PreprocessAircraftList(JArray aircraftList, float North, float East, float South, float West) 
        {
            JArray arr = new JArray();
            foreach (var aircraft in aircraftList)
            {
                PointF loc = new PointF((float)aircraft["Lat"], (float)aircraft["Long"]);
                if (IsInScreen(loc)) 
                {
                    arr.Add(aircraft);
                }
            }
            return arr;
        }

        

        
    }
}
