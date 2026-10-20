package com.shop.event;

/** Published whenever a product's stock changes. Streamed to browsers over SSE. */
public record StockChangedEvent(Long productId, int stock) {
}
