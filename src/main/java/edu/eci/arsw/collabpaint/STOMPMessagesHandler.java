package edu.eci.arsw.collabpaint;

import edu.eci.arsw.collabpaint.model.Point;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
    private static final Logger logger = LoggerFactory.getLogger(STOMPMessagesHandler.class);

    private Map<String, CopyOnWriteArrayList<Point>> conex = new ConcurrentHashMap<>();
    private final SimpMessagingTemplate msgt;

    @Autowired
    public STOMPMessagesHandler(SimpMessagingTemplate msgt) {
        this.msgt = msgt;
    }

    @MessageMapping("/newpoint.{numdibujo}")
    public void handlePointEvent(Point pt, @DestinationVariable String numdibujo) throws Exception {
        
        // Log the drawing ID without exposing user-controlled data
        logger.info("Nuevo punto recibido en el servidor para dibujo ID: {}", numdibujo);
        
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


