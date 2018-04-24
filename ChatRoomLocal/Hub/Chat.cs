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
        private static JArray jarray;
        private static JObject filteredKeys;
        private static int updateDuration;
        private static int xxx;
        private static long curTimestamp;
        private static int speedup;
        private static int realDuration;
        private static JArray lastAircraftList;
        public void StartUpdate(int xxx, 
                                float North, float East, float South, float West)
        {
            Clients.All.SendAsync("echo", -1);

            ind = 0;
            xxx = 567;
            updateDuration = 1 * 1000;
            curTimestamp = -1;
            speedup = 6;
            realDuration = 3 * 10 * 1000;
            lastAircraftList = null;

            Console.WriteLine(updateDuration);
            string data = ProcessFile(".\\util\\london-aircraft.json"); 
            jarray = JArray.Parse(data);

            string dataFilteredKeys = ProcessFile(".\\util\\stat\\filtered-plane.json"); 
            filteredKeys = JObject.Parse(dataFilteredKeys);

            Console.WriteLine("update duration {0}", updateDuration);
            SetTimer(updateDuration);
        }

        private void SetTimer(int interval)
        {
            aTimer = new System.Timers.Timer(interval);
            aTimer.Elapsed += (sender, e) => {
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

        public void UpdateBound(int Ind, float North, float East, float South, float West) {
            
            Console.WriteLine(Ind);
            JArray verifiedList;
            string json;

            while (true) {
                verifiedList = PreprocessAircraftList((JArray)jarray[Ind], North, East, South, West);
                json = verifiedList.ToString();
                int indPro = 0;
                while (true) {
                    if ((long)(((JArray)verifiedList)[indPro]["PosTime"]) > -1) {
                        updateDuration = (int)(((long)(((JArray)verifiedList)[indPro]["PosTime"]) - (long)curTimestamp));
                        break;
                    }
                    indPro++;
                }
                if (curTimestamp < 0) {
                    curTimestamp = (long)((((JArray)verifiedList))[indPro]["PosTime"]);
                    Ind++;
                    continue;
                }
                curTimestamp = (long)((((JArray)verifiedList))[indPro]["PosTime"]);
                Ind++;
                verifiedList = PreprocessAircraftList((JArray)jarray[Ind], North, East, South, West);
                json = verifiedList.ToString();

                
                if ((float)updateDuration < (float)realDuration * 0.7) {
                    ind++;
                    continue;
                }
                break;
            };
            Console.WriteLine("timer duration {0}", updateDuration/speedup);
            if (updateDuration > realDuration * 3) {
                updateDuration = 200;
                Console.WriteLine("reset  duration");
            }
            Clients.Client(Context.ConnectionId).SendAsync("updateAircraft", updateDuration/speedup, json);
            // float durationScale = getDurationScale(verifiedList, lastAircraftList);
            lastAircraftList = (JArray)verifiedList.DeepClone();
            changeInterval(updateDuration/speedup);
        }

        // private static JObject jarr2jobj(JArray a) {
        //     JObject objA = new JObject();
        //     foreach (JObject x in a) {
        //         JObject loc = new JObject();
        //         loc["Lat"] = x["Lat"];
        //         loc["Long"] = x["Long"];
        //         if (hasKey("PosTime", x)) loc["Postime"] = x["PosTime"];
        //         objA[x["Icao"]] = loc;
        //     }
        //     return objA;
        // }
        // private static float getDurationScale(JArray a, JArray b) {
        //    JObject objA = jarr2jobj(a);
        //    JObject objB = jarr2jobj(b);
        //    float 
        //     foreach (var x in objA) {
        //         if (hasKey(x.Key, objB)) {
        //             float lat1 = (float)x.Value["Lat"];
        //             float long1 = (float)x.Value["Long"];
        //             float postime1 = (float)x.Value["PosTime"];
        //             float lat2 = (float)objB["Lat"];
        //             float long2 = (float)objB["Long"];
        //             float postime2 = (float)objB["PosTime"];
        //             // dis += 
        //         }
        //     }
        // }
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

        private static bool hasKey(string key, JObject obj) {
                    var msgProperty = obj.Property(key);
                    if (msgProperty == null) return false;
                    return true;

        }
        private JArray PreprocessAircraftList(JArray aircraftList, float North, float East, float South, float West) 
        {
            JArray arr = new JArray();
            foreach (var aircraft in aircraftList)
            {
                PointF loc = new PointF((float)aircraft["Lat"], (float)aircraft["Long"]);

                // if (IsInScreen(loc, North, East, South, West)) 
                if (IsLatValid(loc.X) && IsLongValid(loc.Y)) 
                {
                    // var msgProperty = filteredKeys.Property((string)aircraft["Icao"]);
                    // if (msgProperty != null) {
                    if (hasKey((string)aircraft["Icao"], filteredKeys)) {
                        arr.Add(aircraft);
                    }
                    arr.Add(aircraft);
                }
            }
            return arr;
        }

        private static double deg2rad(double deg) {
            return deg * (Math.PI) / 180.0;
        }
        private static double dis(double lat1, double lat2, double long1, double long2) {
            double R = 6371;
            double dLat = deg2rad(lat2-lat1);
            double dLon = deg2rad(long2-long1);
            double a = Math.Sin(dLat/2) * Math.Sin(dLat/2) +
            Math.Cos(deg2rad(lat1)) * Math.Cos(deg2rad(lat2)) * 
            Math.Sin(dLon/2.0) * Math.Sin(dLon/2.0);
            double c = 2.0 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1.0-a));
            double d = R * c;
            return d;
        }
    }
}
