package com.shop.event;

/** Published when an admin creates, updates or deletes a product. action: created | updated | deleted */
public record CatalogChangedEvent(String action, Long productId) {
}
