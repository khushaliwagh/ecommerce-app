package com.shop.service;

import com.shop.event.CatalogChangedEvent;
import com.shop.event.PurchaseEvent;
import com.shop.event.StockChangedEvent;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Fan-out of live events to every connected browser using Server-Sent Events.
 * Events are only sent after the DB transaction that caused them has committed.
 */
@Component
public class StockBroadcaster {

    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public SseEmitter subscribe() {
        SseEmitter emitter = new SseEmitter(0L); // 0 = never time out
        emitters.add(emitter);
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError(t -> emitters.remove(emitter));
        try {
            emitter.send(SseEmitter.event().name("hello").data("connected"));
        } catch (IOException ex) {
            emitters.remove(emitter);
        }
        return emitter;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onStockChanged(StockChangedEvent event) {
        broadcast("stock", event);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onPurchase(PurchaseEvent event) {
        broadcast("purchase", event);
    }

    /** An admin added / edited / removed a product: tell every browser to re-fetch the catalogue. */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onCatalogChanged(CatalogChangedEvent event) {
        broadcast("catalog", event);
    }

    /** Keeps proxies (Render, Nginx) from closing idle streams. */
    @Scheduled(fixedRate = 15_000)
    public void heartbeat() {
        broadcast("ping", "ok");
    }

    public int listeners() {
        return emitters.size();
    }

    private synchronized void broadcast(String name, Object data) {
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name(name).data(data, MediaType.APPLICATION_JSON));
            } catch (Exception ex) {
                emitters.remove(emitter);
            }
        }
    }
}
