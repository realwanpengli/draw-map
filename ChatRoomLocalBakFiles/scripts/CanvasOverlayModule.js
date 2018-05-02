/*
 * Copyright(c) 2017 Microsoft Corporation. All rights reserved.
 *
 * This code is licensed under the MIT License (MIT).
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
*/
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/// <reference path="../../Common/typings/MicrosoftMaps/Microsoft.Maps.d.ts"/>
var CanvasOverlay = (function (_super) {
    __extends(CanvasOverlay, _super);
    /**********************
    * Constructor
    ***********************/
    /**
     * @contructor
     * @param drawCallback A callback function that is triggered when the canvas is ready to be rendered for the current map view.
     */
    function CanvasOverlay(drawCallback) {
        var _this = _super.call(this) || this;
        _this._drawCallback = drawCallback;
        return _this;
    }
    /**********************
    * Overridden functions
    ***********************/
    /**
     * CanvasOverlay added to map, load canvas.
     */
    CanvasOverlay.prototype.onAdd = function () {
        console.log("on add");
        //Create a canvas for rendering.
        // this._div = document.createElement('div');
        // this._div.setAttribute('id','mydiv')
        this._canvas = document.createElement('canvas');
        this._canvas.setAttribute('id','flightMapCanvas')
        this._canvas.style.position = 'absolute';
        this._canvas.style.left = '0px';
        this._canvas.style.top = '0px';
        // this._div.appendChild(this._canvas);
        //Add the canvas to the overlay.            
        this.setHtmlElement(this._canvas);
        // add fabric canvas
        

        // console.log("fabric ", this._fabric);
    };
    ;
    /**
     * CanvasOverlay loaded, attach map events for updating canvas.
     */
    CanvasOverlay.prototype.onLoad = function () {
        //
        console.log("on load");
        var total = 100,
    blobs = new Array(total),
    myfps = 60,
    updateTime = 1000 / myfps,
    mouse_pos = { x: 0, y: 0 };

        this._fabric = new  fabric.Canvas('flightMapCanvas', {
            renderOnAddRemove: false,
             selection: false
         });
         this._fabric.setHeight($('#myMap').height());
         this._fabric.setWidth($('#myMap').width());


        //  this._fabric.on('mouse:down', function(options) {
        //     mouse_pos = canvas.getPointer(options.e);
        //     console.log('fabric clicked');
        //   });

        // $("#myMap").on("click", function(event){
            
        // });

        

        // original
        var self = this;
        var map = self.getMap();
        //Get the current map view information.
        this._zoomStart = map.getZoom();
        this._centerStart = map.getCenter();
        //Redraw the canvas.
        self._redraw();

        //When the map stops moving, render new data on the canvas.
        self._viewChangeEndEvent = Microsoft.Maps.Events.addHandler(map, 'viewchangeend', function (e) {
            self.updateCanvas();
        });
        //Update the position of the overlay when the map is resized.
        self._mapResizeEvent = Microsoft.Maps.Events.addHandler(this.getMap(), 'mapresize', function (e) {
            self.updateCanvas();
        });
    };

    var selfFabric = this._fabric;

    CanvasOverlay.prototype.updateCanvas = function () {
        console.log("updateCanvas");
        var map = this.getMap();
        //Only render the canvas if it isn't in streetside mode.
        if (map.getMapTypeId() !== Microsoft.Maps.MapTypeId.streetside) {
            this._canvas.style.display = '';
            //Reset CSS position and dimensions of canvas.
            // this._updatePosition(0, 0, map.getWidth(), map.getHeight());
            //Redraw the canvas.
            this._redraw();
            //Get the current map view information.
            this._zoomStart = map.getZoom();
            this._centerStart = map.getCenter();
            this._fabric.setHeight($(window).height()*2);
            this._fabric.setWidth($(window).width()*2);
            console.log("updateCanvas fabric ", this._fabric.getWidth(), this._fabric.getHeight());
            console.log("updateCanvas window ", $(window).width(), $(window).height());
            this._fabric.renderAll();
        }
    };
    /**
     * When the CanvasLayer is removed from the map, release resources.
     */
    CanvasOverlay.prototype.onRemove = function () {
        this.setHtmlElement(null);
        this._canvas = null;
        //Remove all event handlers from the map.
        Microsoft.Maps.Events.removeHandler(this._viewChangeEvent);
        Microsoft.Maps.Events.removeHandler(this._viewChangeEndEvent);
    };
    /**********************
    * Private Functions
    ***********************/
    /**
     * Simple function for updating the CSS position and dimensions of the canvas.
     * @param x The horizontal offset position of the canvas.
     * @param y The vertical offset position of the canvas.
     * @param w The width of the canvas.
     * @param h The height of the canvas.
     */
    CanvasOverlay.prototype._updatePosition = function (x, y, w, h) {
        //Update CSS position.
        // this._canvas.style.left = x + 'px';
        // this._canvas.style.top = y + 'px';
        // //Update CSS dimensions.
        // this._canvas.style.width = w + 'px';
        // this._canvas.style.height = h + 'px';
    };
    /**
     * Redraws the canvas for the current map view.
     */
    CanvasOverlay.prototype._redraw = function () {
        // this._fabric.renderAll();

        //Clear canvas by updating dimensions. This also ensures canvas stays the same size as the map.
        // this._canvas.width = this.getMap().getWidth();
        // this._canvas.height = this.getMap().getHeight();
        //Call the drawing callback function if specified.
        if (this._drawCallback) {
            this._drawCallback(this._canvas);
        }
        // this._fabric.renderAll();   
        console.log("CanvasOverlay redraw");
    };
    return CanvasOverlay;
}(Microsoft.Maps.CustomOverlay));
//Call the module loaded function.
Microsoft.Maps.moduleLoaded('CanvasOverlayModule');
//# sourceMappingURL=CanvasOverlayModule.js.map