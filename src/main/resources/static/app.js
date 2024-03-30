var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;
    var canvas;

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };
    
    
    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function () {
        //console.info('Connecting to WS...');
        console.log("inicio aaa");
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint', function (eventbody) {
                var newPoint=JSON.parse(eventbody.body);
                // var x= newPoint.x;
                // var y= newPoint.y;
                // console.log("inicio");
                // console.log('nuevo punto recibido -X' + x + 'y:'  + y );
                // var newPoint = new Point(x,y);
                // addPointToCanvas(newPoint);
                var pointJSON=JSON.parse(eventbody.body);
                addPointToCanvas(pointJSON);
                
                
            });
        });

    };
    
    

    return {

        init: function () {
            canvas = document.getElementById("canvas");
            canvas.AddEventListener("click", function (event){

                var mousePosition = getMousePosition(event);
                app.publishPoint(mousePosition.x,mousePosition.y);

            });
            
            //websocket connection
            connectAndSubscribe();
        },

        publishPoint: function(px,py){
            var pt=new Point(px,py);
           // console.info("publishing point at "+pt);
            addPointToCanvas(pt);
            console.log(stompClient);
            stompClient.send("/topic/newpoint.", {}, JSON.stringify(pt));
            app.init();
            alert('nuevo punto recibido x' + px + 'y:'  + py );
            
            //publicar el evento
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();