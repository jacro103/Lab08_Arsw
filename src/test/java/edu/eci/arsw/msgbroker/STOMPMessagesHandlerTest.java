package edu.eci.arsw.msgbroker;



import org.junit.Before;
import org.junit.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import edu.eci.arsw.collabpaint.STOMPMessagesHandler;
import edu.eci.arsw.collabpaint.model.Point;

import static org.mockito.Mockito.*;

public class STOMPMessagesHandlerTest {

    @Mock
    private SimpMessagingTemplate simpMessagingTemplate;

    @InjectMocks
    private STOMPMessagesHandler stompMessagesHandler;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
    }

    @Test
    public void whenHandlePointEvent_shouldSendMessage() {
        Point point = new Point(10, 20);
        String numdibujo = "1";
        
        stompMessagesHandler.handlePointEvent(point, numdibujo);
        
        verify(simpMessagingTemplate, times(1))
            .convertAndSend("/topic/newpoint." + numdibujo, point);
    }
}

