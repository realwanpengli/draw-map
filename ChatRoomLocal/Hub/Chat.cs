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
        
        private static int ind;
        // private float North, South, West, East;
        private static JArray jarray;

        private static int xxx;
        public void StartUpdate(int updateDuration, 
                                float North, float East, float South, float West)
        {
            Clients.All.SendAsync("echo", -1);

            ind = 0;
            xxx = 567;

            Console.WriteLine(updateDuration);
            string data = ProcessFile(".\\util\\london-aircraft.json"); 
            jarray = JArray.Parse(data);
            // jarray = (JArray)JsonConvert.DeserializeObject(data);
            // Console.WriteLine("jarray = ");
            // Console.WriteLine(jarray);
            Console.WriteLine("update duration {0}", updateDuration);
            SetTimer(updateDuration);
        }

        private void SetTimer(int interval)
        {
            aTimer = new System.Timers.Timer(interval);
            aTimer.Elapsed += (sender, e) => {
                Console.WriteLine("update bound request");
                context.Clients.All.SendAsync("echo", 777);
                context.Clients.All.SendAsync("updateBoundRequest", -1);
            };
            aTimer.AutoReset = true;
            aTimer.Enabled = true;
        }


        public void UpdateBound(float North, float East, float South, float West) {
            
            // Console.WriteLine("UpdateBound jarray = ");
            // Console.WriteLine(jarray);
            Console.WriteLine(xxx);

            // todo: send different client different data according to their bound
            if (ind >= jarray.Count) {
                ind = 0;
            }
            var verifiedList = PreprocessAircraftList((JArray)jarray[ind++], North, East, South, West);
            var json = verifiedList.ToString();

            Clients.Client(Context.ConnectionId).SendAsync("updateAircraft", -1, json);
        }

        public void Echo(string name, 
            float North_, float East_, float South_, float West_)
        {
            Console.WriteLine("Update bound");
        }


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

        private bool IsInScreen(PointF pt, float North, float East, float South, float West) 
        {
            // is location valid
            if (!IsLatValid(pt.X) || !IsLongValid(pt.Y)) {
                Console.WriteLine("location invalid");
                return false;
            }

            float lat = pt.X;
            float long_ = pt.Y;

            if (West < East)
                return long_ < East && long_ > West && lat < North && lat > South;

            // it crosses the date line
            return (long_ < East || long_ > West) && lat < North && lat > South;    

        }

        private JArray PreprocessAircraftList(JArray aircraftList, float North, float East, float South, float West) 
        {
            JArray arr = new JArray();
            foreach (var aircraft in aircraftList)
            {
                Console.WriteLine("Edge North {0} East {1}  South {2} West {3}", North, East, South, West);
                Console.WriteLine("aircraft ({0}, {1})", (float)aircraft["Lat"], (float)aircraft["Long"]);
                PointF loc = new PointF((float)aircraft["Lat"], (float)aircraft["Long"]);
                if (IsInScreen(loc, North, East, South, West)) 
                {
                    Console.WriteLine("add aircraft");
                    arr.Add(aircraft);
                }
            }
            return arr;
        }
    }
}
