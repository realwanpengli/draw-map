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

    public interface IFlightMapHub {
        void StartUpdate();
        void StopUpdate();
        void RestartUpdate(int resetind);
    }

}
