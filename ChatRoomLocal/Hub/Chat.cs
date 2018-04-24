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
        private static JObject filteredKeys;

        private static int updateDuration;
        private static int xxx;
        private static long curTimestamp;
        public void StartUpdate(int xxx, 
                                float North, float East, float South, float West)
        {
            Clients.All.SendAsync("echo", -1);

            ind = 0;
            xxx = 567;
            updateDuration = 1 * 1000;
            curTimestamp = -1;

            Console.WriteLine(updateDuration);
            string data = ProcessFile(".\\util\\london-aircraft.json"); 
            jarray = JArray.Parse(data);

            string dataFilteredKeys = ProcessFile(".\\util\\filtered-plane.json"); 
            // Console.WriteLine(dataFilteredKeys);
            filteredKeys = JObject.Parse(dataFilteredKeys);

            Console.WriteLine("update duration {0}", updateDuration);
            // Clients.All.SendAsync("updateBoundRequest", ind++);
            SetTimer(updateDuration);
        }

        private void SetTimer(int interval)
        {
            aTimer = new System.Timers.Timer(interval);
            aTimer.Elapsed += (sender, e) => {
                Console.WriteLine("update bound request");
                // context.Clients.All.SendAsync("echo", 777);
                context.Clients.All.SendAsync("updateBoundRequest", ind++);
                if (ind >= jarray.Count) {
                    ind = 0;
                }
            };
            aTimer.AutoReset = false;
            aTimer.Enabled = true;
        }

        private void changeInterval(int interval) {
            aTimer.Interval = interval;
            aTimer.Start();
        }

        // public void SetTimer(int interval)
        // {
        //     while(true) {
        //         Console.WriteLine("update bound request");
        //         Clients.All.SendAsync("updateBoundRequest", ind++);
        //         if (ind >= jarray.Count) {
        //             ind = 0;

        //         }
        //         Thread.Sleep(updateDuration);
                
        //     };
        // }

        public void UpdateBound(int Ind, float North, float East, float South, float West) {
            
            // Console.WriteLine("UpdateBound jarray = ");
            // Console.WriteLine(jarray);
            Console.WriteLine(Ind);
            // todo: send different client different data according to their bound
            while (true) {
                var verifiedList = PreprocessAircraftList((JArray)jarray[Ind], North, East, South, West);
                var json = verifiedList.ToString();
                int indPro = 0;
                while (true) {
                    if ((long)(((JArray)verifiedList)[indPro]["PosTime"]) > -1) {
                        updateDuration = (int)(((long)(((JArray)verifiedList)[indPro]["PosTime"]) - (long)curTimestamp));
                        updateDuration /= 4;
                        break;
                    }
                    indPro++;
                    Console.WriteLine("indPro = {0}", indPro);
                }
                if (curTimestamp < 0) {
                    curTimestamp = (long)((((JArray)verifiedList))[indPro]["PosTime"]);
                    Ind++;
                    continue;
                }
                curTimestamp = (long)((((JArray)verifiedList))[indPro]["PosTime"]);
                Console.WriteLine("XXX duration {0}", updateDuration);
                Ind++;
                verifiedList = PreprocessAircraftList((JArray)jarray[Ind], North, East, South, West);
                json = verifiedList.ToString();

                Console.WriteLine("Ind = {0}", Ind);
                
                if (updateDuration < 6 * 1000) {
                    ind++;
                    continue;
                }
                // send to server
                Clients.Client(Context.ConnectionId).SendAsync("updateAircraft", updateDuration, json);
                break;
            };
            Console.WriteLine("timer duration {0}", updateDuration);
            Console.WriteLine("cur timestamp {0}", curTimestamp);
            if (updateDuration > 50 * 1000) updateDuration = 200;
            changeInterval(updateDuration);
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
                // Console.WriteLine("Edge North {0} East {1}  South {2} West {3}", North, East, South, West);
                // Console.WriteLine("aircraft ({0}, {1})", (float)aircraft["Lat"], (float)aircraft["Long"]);
                
                PointF loc = new PointF((float)aircraft["Lat"], (float)aircraft["Long"]);

                // if (IsInScreen(loc, North, East, South, West)) 
                if (IsLatValid(loc.X) && IsLongValid(loc.Y)) 
                {
                    // var msgProperty = filteredKeys.Property((string)aircraft["Icao"]);
                    // if (msgProperty != null) {
                    //     arr.Add(aircraft);
                    // }
                    arr.Add(aircraft);
                }
            }
            return arr;
        }
    }
}
