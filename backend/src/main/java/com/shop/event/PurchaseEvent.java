package com.shop.event;

/** Public, anonymised activity line: only product, quantity and city leave the server. */
public record PurchaseEvent(Long productId, String productName, int quantity, String city) {
}
