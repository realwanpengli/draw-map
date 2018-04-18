PanningOverlay.prototype = new Microsoft.Maps.CustomOverlay({ beneathLabels : false });

    function PanningOverlay() {

                this.panLondonBtn = document.createElement('input');

                this.panLondonBtn.type = 'button';

                this.panLondonBtn.value = 'London';

                this.panLondonBtn.onclick = function () {

                    panMap('London');

                };



                this.panShanghaiBtn = document.createElement('input');

                this.panShanghaiBtn.type = 'button';

                this.panShanghaiBtn.value = 'Shanghai';

                this.panShanghaiBtn.onclick = function () {

                    panMap('Shanghai');

                };

                
                this.panNewyorkBtn = document.createElement('input');

                this.panNewyorkBtn.type = 'button';

                this.panNewyorkBtn.value = 'NewYork';

                this.panNewyorkBtn.onclick = function () {

                    panMap('NewYork');

                };

                


    }




    PanningOverlay.prototype.onAdd = function () {

                //Create a div that will hold pan buttons.

                var container = document.createElement('div');

                container.appendChild(this.panLondonBtn);
                container.appendChild(this.panShanghaiBtn);
                container.appendChild(this.panNewyorkBtn);



                container.style.position = 'absolute';

                container.style.top = '10px';

                container.style.left = '10px';

                this.setHtmlElement(container);

    };