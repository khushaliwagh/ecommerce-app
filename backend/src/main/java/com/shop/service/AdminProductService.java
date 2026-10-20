package com.shop.service;

import com.shop.dto.ProductRequest;
import com.shop.event.CatalogChangedEvent;
import com.shop.event.StockChangedEvent;
import com.shop.exception.NotFoundException;
import com.shop.model.Product;
import com.shop.repository.ProductRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminProductService {

    private final ProductRepository repo;
    private final ApplicationEventPublisher events;

    public AdminProductService(ProductRepository repo, ApplicationEventPublisher events) {
        this.repo = repo;
        this.events = events;
    }

    @Transactional
    public Product create(ProductRequest req) {
        Product saved = repo.save(apply(new Product(), req));
        events.publishEvent(new CatalogChangedEvent("created", saved.getId()));
        return saved;
    }

    @Transactional
    public Product update(Long id, ProductRequest req) {
        // lock the row so an update can't interleave with a checkout reducing stock
        Product product = repo.findByIdForUpdate(id)
                .orElseThrow(() -> new NotFoundException("Product " + id + " not found"));
        int oldStock = product.getStock();
        apply(product, req);
        Product saved = repo.save(product);
        if (saved.getStock() != oldStock) {
            events.publishEvent(new StockChangedEvent(saved.getId(), saved.getStock()));
        }
        events.publishEvent(new CatalogChangedEvent("updated", saved.getId()));
        return saved;
    }

    @Transactional
    public void delete(Long id) {
        Product product = repo.findById(id)
                .orElseThrow(() -> new NotFoundException("Product " + id + " not found"));
        repo.delete(product);
        events.publishEvent(new CatalogChangedEvent("deleted", id));
    }

    private Product apply(Product p, ProductRequest r) {
        p.setName(r.name().trim());
        p.setCategory(r.category().trim());
        p.setDescription(blankToNull(r.description()));
        p.setPrice(r.price());
        p.setImageUrl(blankToNull(r.imageUrl()));
        p.setStock(r.stock());
        p.setRating(r.rating());
        p.setFeatured(r.featured());
        p.setBadge(blankToNull(r.badge()));
        return p;
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
