// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Microsoft.Azure.SignalR.Samples.ChatRoom
{
    using Microsoft.AspNetCore.SignalR;
    using System;
    using System.IO;
    using System.Collections;
    using Newtonsoft.Json.Linq;
    using Newtonsoft.Json;
    using System.Timers;
    using System.Drawing;

    public class Chat : Hub, IChat
    {
        IHubContext<Chat> context;
        public Chat(IHubContext<Chat> context)
        {
            this.context = context;
        }

        private static System.Timers.Timer aTimer;
        
        private static int ind = 0;
        private static JArray jarray = null;
        // private static JObject filteredKeys;
        private static long updateDuration = 1;
        // private static int xxx;
        private static long curTimestamp = -1;
        private static long speedup = 15;
        private static long realDuration = 15 * 1000;

        public void StartUpdate()
        {
            Console.WriteLine("Start Updating");
            if (jarray == null) {
                string data = ProcessFile("./wwwroot/data/tcp-aircraft-small.json");
                jarray = JArray.Parse(data);
            }
            updateDuration = 1;
            SetTimer(updateDuration);
        }

        public void StopUpdate() {
            Console.WriteLine("Stop updating.");
            aTimer.Stop();
        }

        private void SetTimer(long interval)
        {
            aTimer = new Timer(interval);
            aTimer.Elapsed += (sender, e) => { OnTimedEvent(sender, e, aTimer);};
            aTimer.AutoReset = false;
            aTimer.Enabled = true;
        }

        private long getPosTime(JArray arr) {
            JObject o = new JObject();
            foreach (var x in arr) {
                o[x["PosTime"].ToString()] = (long)0; // get key
            }
            foreach (var x in arr) {
                o[x["PosTime"].ToString()] = (long)o[x["PosTime"].ToString()] + (long)1; // count
            }
            long postime = -1;
            long maxCnt = 0;
            foreach (var x in o) {
                if (x.Key != ((long)-1).ToString() && maxCnt < (int)x.Value) {
                    maxCnt = (long)x.Value;
                    postime = Convert.ToInt64(x.Key);
                }
            }
            return postime;
        }
        public void OnTimedEvent(Object source, ElapsedEventArgs e, Timer aTimer) {
            
            JArray verifiedList;
            string json;
            
            // replay
            if (ind == jarray.Count) {
            // if (ind == 10) {
                ind = 0;
                curTimestamp = -1;
            }
            // get valid duration
            while (true) {
                verifiedList = PreprocessAircraftList((JArray)jarray[ind]);
                json = verifiedList.ToString();
                long postime = getPosTime(verifiedList);
                Console.WriteLine("postime = {0}", postime);
                if (curTimestamp < 0) 
                    curTimestamp = postime - realDuration;
                updateDuration = (postime - curTimestamp);

                if ((float)updateDuration < (float)realDuration * 0.7) {
                    Console.WriteLine("Update duration: {1}; Skip to {0}", ind, updateDuration);
                    ind++;
                    continue;
                }
                curTimestamp = postime;
                ind++;
                break;
            };
            if (updateDuration > realDuration * 3) {
                Console.WriteLine("Update suddenlly slow");
            }
            aTimer.Interval = updateDuration/speedup;
            aTimer.Start();
            Console.WriteLine("curTimestamp = {0}", curTimestamp);
            Console.WriteLine("Call client to update aircrafts location. Duration is {0}ms. Index is {1}", updateDuration/speedup, ind);
            context.Clients.All.SendAsync("updateAircraft", updateDuration/speedup, json, ind-1);
            
        }

        private string ProcessFile(string path) 
        {
            Console.WriteLine("Processed data '{0}'.", path);
            string contents = File.ReadAllText(path);
            if (contents == null) Console.WriteLine("can't read file"); 
            return contents;
        }
        
        private JArray PreprocessAircraftList(JArray aircraftList) 
        {
            JArray arr = new JArray();
            foreach (var aircraft in aircraftList)
            {
                PointF loc = new PointF((float)aircraft["Lat"], (float)aircraft["Long"]);

                if ((bool)aircraft["Gnd"] == false) 
                {
                    arr.Add(aircraft);
                }
            }
            return arr;
        }
    }
}
