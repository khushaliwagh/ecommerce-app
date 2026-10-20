package com.shop.service;

import com.shop.event.PurchaseEvent;
import com.shop.event.StockChangedEvent;
import com.shop.model.Product;
import com.shop.repository.ProductRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

/**
 * DEMO ONLY. Generates fake purchases and restocks so the real-time UI has something
 * to show when nobody else is using the site. Disable with SIMULATION_ENABLED=false.
 */
@Component
@ConditionalOnProperty(name = "shop.simulation.enabled", havingValue = "true")
public class StockSimulator {

    private static final String[] CITIES = {
            "Pune", "Mumbai", "Kolhapur", "Bengaluru", "Delhi", "Hyderabad",
            "Chennai", "Ahmedabad", "Jaipur", "Nagpur", "Indore", "Kochi"
    };

    private final ProductRepository products;
    private final ApplicationEventPublisher events;

    public StockSimulator(ProductRepository products, ApplicationEventPublisher events) {
        this.products = products;
        this.events = events;
    }

    @Scheduled(fixedDelayString = "${shop.simulation.interval-ms:9000}", initialDelay = 12_000)
    @Transactional
    public void tick() {
        List<Product> all = products.findAll();
        if (all.isEmpty()) return;

        ThreadLocalRandom rnd = ThreadLocalRandom.current();
        Long id = all.get(rnd.nextInt(all.size())).getId();
        Product p = products.findByIdForUpdate(id).orElse(null);
        if (p == null) return;

        if (p.getStock() <= 4) {
            p.setStock(p.getStock() + 20 + rnd.nextInt(20));   // warehouse restock
            events.publishEvent(new StockChangedEvent(p.getId(), p.getStock()));
        } else {
            int qty = 1 + rnd.nextInt(2);
            p.setStock(p.getStock() - qty);
            events.publishEvent(new StockChangedEvent(p.getId(), p.getStock()));
            events.publishEvent(new PurchaseEvent(p.getId(), p.getName(), qty, CITIES[rnd.nextInt(CITIES.length)]));
        }
    }
}
