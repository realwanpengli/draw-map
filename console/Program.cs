using System;
using System.Timers;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
namespace console
{
    class Program
    {
        private static System.Timers.Timer aTimer;

   public static void Main()
   {

        string json = @"[
            'Small',
            'Medium',
            'Large'
        ]";

        JArray a = JArray.Parse(json);
        JArray b = (JArray)a.DeepClone();
        b[0]="11";
        Console.WriteLine(a);
        Console.WriteLine(b);

        JObject obj1 = new JObject();
        obj1["a"] = 1;
        obj1["b"] = 2;
        foreach (var o in obj1)
        {
            Console.WriteLine(o.Key);
            Console.WriteLine(o.Value);
        }
        Console.WriteLine(obj1);

    //   SetTimer();

    // get timestamp
    long unixTimestamp = (long)(DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1))).TotalMilliseconds;
    Console.WriteLine(unixTimestamp);

      Console.WriteLine("\nPress the Enter key to exit the application...\n");
      Console.WriteLine("The application started at {0:HH:mm:ss.fff}", DateTime.Now);
      Console.ReadLine();
      aTimer.Stop();
      aTimer.Dispose();

      Console.WriteLine("Terminating the application...");
   }

   private static void SetTimer()
   {
        // Create a timer with a two second interval.
        aTimer = new System.Timers.Timer(2000);
        // Hook up the Elapsed event for the timer. 
        aTimer.Elapsed += OnTimedEvent;
        aTimer.AutoReset = true;
        aTimer.Enabled = true;
    }

    private static void OnTimedEvent(Object source, ElapsedEventArgs e)
    {
        Console.WriteLine("The Elapsed event was raised at {0:HH:mm:ss.fff}",
                          e.SignalTime);
    }
    }
}
