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
    public class Chat : Hub
    {
        private bool reset = false;
        public void BroadcastMessage(int updateDuration, string message)
        {
            Console.WriteLine(updateDuration);
            Console.WriteLine(message);

            string data = ProcessFile(".\\util\\london-aircraft.json"); 
            var jarray = JArray.Parse(data);
            for (int i = 0; i < jarray.Count; i++)
            {
                var json = jarray[i].ToString();
                Console.Write("i=");
                Console.WriteLine(i);
                Clients.All.SendAsync("broadcastMessage", i, json);
                Thread.Sleep(updateDuration);
            }
        }

        public void Echo(string name, string message)
        {
            reset = true;
            Console.WriteLine("reset");
            // Clients.Client(Context.ConnectionId).SendAsync("echo", name, message + " (echo from server)");
        }


        private void ProcessDirectory(string targetDirectory, int updateDuration) 
        {
            // Process the list of files found in the directory.
            string [] fileEntries = Directory.GetFiles(targetDirectory);
            foreach(string fileName in fileEntries) {
                if (reset) break;
                string contents = ProcessFile(fileName);
                Clients.All.SendAsync("broadcastMessage", fileName, contents);
                Console.WriteLine("sleep");
                Thread.Sleep(updateDuration);
            }
            reset = false;

            // Recurse into subdirectories of this directory.
            // string [] subdirectoryEntries = Directory.GetDirectories(targetDirectory);
            // foreach(string subdirectory in subdirectoryEntries)
            //     ProcessDirectory(subdirectory);
        }

        private string ProcessFile(string path) 
        {
            Console.WriteLine("Processed file '{0}'.", path);
            string contents = File.ReadAllText(path);
            // Console.WriteLine(contents);
            return contents;
        }
    }
}
