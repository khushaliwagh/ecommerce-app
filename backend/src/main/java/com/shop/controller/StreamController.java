package com.shop.controller;

import com.shop.service.StockBroadcaster;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class StreamController {

    private final StockBroadcaster broadcaster;

    public StreamController(StockBroadcaster broadcaster) {
        this.broadcaster = broadcaster;
    }

    /** Live stock + purchase events (Server-Sent Events). */
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream() {
        return broadcaster.subscribe();
    }

    /** Used by Render's health check. */
    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of("status", "UP", "liveClients", broadcaster.listeners());
    }
}
