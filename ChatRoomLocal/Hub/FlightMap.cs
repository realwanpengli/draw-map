// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Microsoft.Azure.SignalR.Samples.FlightMap
{
    using Microsoft.AspNetCore.SignalR;
    using System;
    using System.IO;
    using System.Collections;
    using Newtonsoft.Json.Linq;
    using Newtonsoft.Json;
    using System.Timers;
    using System.Drawing;

    public class FlightMapHub : Hub, IFlightMapHub
    {
        IHubContext<FlightMapHub> context;
        public FlightMapHub(IHubContext<FlightMapHub> context)
        {
            this.context = context;
        }

        private static System.Timers.Timer timer;
        
        private static int ind = 0;
        private static JArray flightData = null;
        private static long updateDuration = 1;
        private static long curTimestamp = -1;
        private static long speedup = 15;
        private static long realDuration = 15 * 1000;

        private Object counterLock = new Object();
        private static long totalVisitors = 0;

        public void CountVisitor() {
            lock(counterLock) {
                totalVisitors++;
                Clients.All.SendAsync("countVisitors", totalVisitors);
            }
        }

        public void StartUpdate()
        {
            Console.WriteLine("Start Updating");
            if (flightData == null) {
                string data = File.ReadAllText("./wwwroot/data/flight.json");
                flightData = JArray.Parse(data);
            }
            updateDuration = 1;
            SetTimer(updateDuration);
        }

        public void RestartUpdate(int resetInd) {
            Console.WriteLine("Restart Updating");
            StopUpdate();
            ind = resetInd;
            updateDuration = 1;
            curTimestamp = -1;
            StartUpdate();
        }
        public void StopUpdate() {
            Console.WriteLine("Stop updating.");
            if (timer != null) timer.Stop();
        }

        private void SetTimer(long interval)
        {
            timer = new Timer(interval);
            timer.Elapsed += (sender, e) => { OnTimedEvent(sender, e, timer);};
            timer.AutoReset = false;
            timer.Enabled = true;
        }

        private long getPosTime(JArray flightList) {
            JObject postimeDict = new JObject();
            foreach (var flight in flightList) {
                postimeDict[flight["PosTime"].ToString()] = (long)0;
            }
            foreach (var flight in flightList) {
                postimeDict[flight["PosTime"].ToString()] = (long)postimeDict[flight["PosTime"].ToString()] + (long)1;
            }
            long postime = -1;
            long maxCnt = 0;
            foreach (var flight in postimeDict) {
                if (flight.Key != ((long)-1).ToString() && maxCnt < (int)flight.Value) {
                    maxCnt = (long)flight.Value;
                    postime = Convert.ToInt64(flight.Key);
                }
            }
            return postime;
        }
        public void OnTimedEvent(Object source, ElapsedEventArgs e, Timer aTimer) {
            string flightListStr;
            
            while (true) {
                // replay
                if (ind == flightData.Count - 1) {
                    ind = 0;
                    curTimestamp = -1;
                }
                flightListStr = ((JArray)flightData[ind]).ToString();
                long postime = getPosTime((JArray)flightData[ind]);
                if (curTimestamp < 0) 
                    curTimestamp = postime - realDuration;
                updateDuration = (postime - curTimestamp);

                if ((float)updateDuration < (float)realDuration * 0.7) {
                    ind++;
                    continue;
                }
                curTimestamp = postime;
                ind++;
                break;
            };
            
            aTimer.Interval = updateDuration/speedup;
            aTimer.Start();
            
            long serverTimestamp = (long)(DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1))).TotalMilliseconds;
            context.Clients.All.SendAsync("updateAircraft", updateDuration/speedup, flightListStr, ind-1, serverTimestamp, curTimestamp, speedup);
            
        }
        
    }
}
