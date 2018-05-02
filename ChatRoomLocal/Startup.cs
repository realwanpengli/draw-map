// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Microsoft.Azure.SignalR.Samples.FlightMap
{
    using Microsoft.AspNetCore.Builder;
    using Microsoft.AspNetCore.Hosting;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.DependencyInjection;

    public class Startup
    {
        public Startup(IHostingEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true);

            builder.AddEnvironmentVariables();
            Configuration = builder.Build();
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddScoped<IFlightMapHub, FlightMapHub>();
            services.AddMvc();
            services.AddSingleton(typeof(IConfiguration), Configuration);
            if (!Constants.UseLoacalSignalR) services.AddAzureSignalR();
            else services.AddSignalR();
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            app.UseMvc(routes => {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=animationController}/{action=notchange}"
                );
            });
            app.UseFileServer();
            
            if (!Constants.UseLoacalSignalR) 
                app.UseAzureSignalR(Configuration[Constants.AzureSignalRConnectionStringKey],
                    builder => 
                    { 
                        builder.UseHub<FlightMapHub>(); 
                    });
            else
                app.UseSignalR(routes =>
                { 
                    routes.MapHub<FlightMapHub>("/chat");
                });
        }
    }
}
