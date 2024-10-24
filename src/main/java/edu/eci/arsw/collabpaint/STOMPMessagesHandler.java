package edu.eci.arsw.collabpaint;

import edu.eci.arsw.collabpaint.model.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.concurrent.CopyOnWriteArrayList;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class STOMPMessagesHandler {
    private Map<String, CopyOnWriteArrayList<Point>> conex = new ConcurrentHashMap<>();
    private final SimpMessagingTemplate msgt;

    @Autowired
    public STOMPMessagesHandler(SimpMessagingTemplate msgt) {
        this.msgt = msgt;
    }

    @MessageMapping("/newpoint.{numdibujo}")
    public void handlePointEvent(Point pt, @DestinationVariable String numdibujo) {
        // Registro de la recepción de un nuevo punto
        System.out.println("Nuevo punto recibido en el servidor: " + pt);
        
        msgt.convertAndSend("/topic/newpoint." + numdibujo, pt);
        
        if (conex.get(numdibujo) != null) {
            conex.get(numdibujo).add(pt);
            if (conex.get(numdibujo).size() % 4 == 0) {
                msgt.convertAndSend("/topic/newpolygon." + numdibujo, conex.get(numdibujo));
                conex.put(numdibujo, new CopyOnWriteArrayList<>());
            }
        } else {
            CopyOnWriteArrayList<Point> n = new CopyOnWriteArrayList<>();
            n.add(pt);
            conex.put(numdibujo, n);
        }
    }
}
