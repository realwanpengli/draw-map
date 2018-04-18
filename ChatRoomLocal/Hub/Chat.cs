// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Microsoft.Azure.SignalR.Samples.ChatRoom
{
    using Microsoft.AspNetCore.SignalR;
    using System;
    using System.Threading;
    using System.IO;
    using System.Collections;

    public class Chat : Hub
    {
        public void BroadcastMessage(int updateDuration, string message)
        {
            Console.WriteLine(updateDuration);
            Console.WriteLine(message);
            // string newName = "hahaha";
            // string newName2 = "hohoho";
            // string newMesssage = "hehehe";

            ProcessDirectory(".\\data", updateDuration);
            // Clients.All.SendAsync("broadcastMessage", name, message);
            // Clients.All.SendAsync("broadcastMessage", newName, newMesssage);
            // Clients.All.SendAsync("broadcastMessage", newName2, newMesssage);
        }

        public void Echo(string name, string message)
        {
            Clients.Client(Context.ConnectionId).SendAsync("echo", name, message + " (echo from server)");
        }


        private void ProcessDirectory(string targetDirectory, int updateDuration) 
        {
            // Process the list of files found in the directory.
            string [] fileEntries = Directory.GetFiles(targetDirectory);
            foreach(string fileName in fileEntries) {
                string contents = ProcessFile(fileName);
                Clients.All.SendAsync("broadcastMessage", fileName, contents);
                Thread.Sleep(updateDuration);
            }

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



        // public static void myUpdate(string msg)
        // {
        //     var hubContext = GlobalHost.ConnectionManager.GetHubContext<Chat>();
        //     hubContext.Clients.All.foo(msg);
        // }
        
        // internal static void updateAircraft(string jsonStr) {
        //     IHubContext context = GlobalHost.ConnectionManager.GetHubContext<Chat>();
        //     context.Clients.messageRecieved(message);
        // }
    }
}
