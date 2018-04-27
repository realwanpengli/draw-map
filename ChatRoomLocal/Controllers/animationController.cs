// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Microsoft.Azure.SignalR.Samples.ChatRoom
{
    using System.Security.Claims;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Azure.SignalR;
    using Microsoft.AspNetCore.SignalR;
    using Microsoft.Extensions.Configuration;
    using System;
    using System.IO;
    
    public class animationController : Controller {

        IChat chat;
        string _password = "demo";
        public animationController(IChat ch) {
            this.chat = ch;
        }

        public string notchange() {
            return "Map doesn't change.";
        }

        public string start(string password) {
            if (password != _password) return "Wrong password.";
            chat.StartUpdate();
            return "Start to animate. ";
        }

        public string stop(string password) {
            if (password != _password) return "Wrong password.";
            chat.StopUpdate();
            return "Stop animation.";
        }
    }
}