var app = (function () {

    let topic = "0"; // Cambiado a let

    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }        
    }

    class Polygon {
        constructor(points) {
            this.points = points;
        }
    }
    
    let stompClient = null; // Cambiado a let
    let canvas; // Cambiado a let

    const addPointToCanvas = function (point) {        
        canvas = document.getElementById("canvas");
        const ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 1, 0, 2 * Math.PI);
        ctx.stroke();
    };
    
    const getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        const rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };

    const drawNewPolygon = function (polygon) {
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(polygon.points[0].x, polygon.points[0].y);
        ctx.fillStyle = '#00FF9B';
        console.log("Longitud: " + polygon.points.length);
        for (let i = 1; i < polygon.points.length; i++) {
            const point = polygon.points[i];
            ctx.lineTo(point.x, point.y);
        }
        ctx.lineTo(polygon.points[0].x, polygon.points[0].y);
        ctx.closePath();
        ctx.fill();
    };

    const connectAndSubscribe = function (topic) {
        console.info('Connecting to WS...');
        const socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        // Subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic' + topic, function (eventbody) {
                // Handle events received from the server
                const newPoint = JSON.parse(eventbody.body);
                if (topic.includes("newpoint")) {
                    addPointToCanvas(newPoint);
                } else {
                    const polygon = new Polygon(newPoint);
                    drawNewPolygon(polygon);
                }
            });
        });
    };

    return {
        // Evento de clic en el canvas para agregar puntos y 
        // establecer la conexión WebSocket para recibir puntos de otros usuarios
        init: function () {
            canvas = document.getElementById("canvas");
            canvas.addEventListener("click", function (event) {
                const mousePosition = getMousePosition(event);
                app.publishPoint(mousePosition.x, mousePosition.y);
            });
            connectAndSubscribe();
        },

        connect: function () {
            const canvas = document.getElementById("canvas");
            const option = document.getElementById("connectionType");
            const drawId = $("#drawId").val();
            topic = option.value + drawId;
            alert("Se ha conectado a: " + drawId);
            connectAndSubscribe(topic);
            if (window.PointerEvent) {
                canvas.addEventListener("pointerdown", function (event) {
                    const point = getMousePosition(event);
                    stompClient.send("/topic" + topic, {}, JSON.stringify(point));
                });
            }
        },

        publishPoint: function (px, py) {
            const pt = new Point(px, py);
            addPointToCanvas(pt);
            stompClient.send("/app" + topic, {}, JSON.stringify(pt));
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
