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

    let addPointToCanvas = function (point) {
        let canvas = document.getElementById("canvas"); // Cambiado a let
        let ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 1, 0, 2 * Math.PI);
        ctx.stroke();
    };

    let getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        let rect = canvas.getBoundingClientRect(); // Cambiado a let
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };

    let drawNewPolygon = function (polygon) {
        let canvas = document.getElementById('canvas'); // Cambiado a let
        let ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(polygon.points[0].x, polygon.points[0].y);
        ctx.fillStyle = '#00FF9B';
        console.log("Longitud: " + polygon.points.length);
        for (let i = 1; i < polygon.points.length; i++) { // Cambiado a let
            let point = polygon.points[i]; // Cambiado a let
            ctx.lineTo(point.x, point.y);
        }
        ctx.lineTo(polygon.points[0].x, polygon.points[0].y);
        ctx.closePath();
        ctx.fill();
    }

    let connectAndSubscribe = function (topic) {
        console.info('Connecting to WS...');
        let socket = new SockJS('/stompendpoint'); // Cambiado a let
        stompClient = Stomp.over(socket);

        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic' + topic, function (eventbody) {
                let newPoint = JSON.parse(eventbody.body); // Cambiado a let
                if (topic.includes("newpoint")) {
                    addPointToCanvas(newPoint);
                } else {
                    let polygon = new Polygon(newPoint); // Cambiado a let
                    drawNewPolygon(polygon);
                }
            });
        });
    };

    return {
        init: function () {
            canvas = document.getElementById("canvas");
            canvas.addEventListener("click", function (event) {
                let mousePosition = getMousePosition(event); // Cambiado a let
                app.publishPoint(mousePosition.x, mousePosition.y);
            });
            connectAndSubscribe();
        },
        connect: function () {
            let canvas = document.getElementById("canvas"); // Cambiado a let
            let option = document.getElementById("connectionType"); // Cambiado a let
            let drawId = $("#drawId").val(); // Cambiado a let
            topic = option.value + drawId;
            alert("Se ha conectado a: " + drawId);
            connectAndSubscribe(topic);
            if (window.PointerEvent) {
                canvas.addEventListener("pointerdown", function (event) {
                    let point = getMousePosition(event); // Cambiado a let
                    stompClient.send("/topic" + topic, {}, JSON.stringify(point));
                });
            }
        },
        publishPoint: function (px, py) {
            let pt = new Point(px, py); // Cambiado a let
            addPointToCanvas(pt);
            stompClient.send("/app" + topic, {}, JSON.stringify(pt));
        },
        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            console.log("Disconnected");
        }
    };
})();
