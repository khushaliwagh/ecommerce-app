package com.shop.dto;

import com.shop.model.CustomerOrder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
        Long id,
        String customerName,
        String email,
        BigDecimal total,
        Instant createdAt,
        List<Line> items
) {
    public record Line(Long productId, String productName, BigDecimal unitPrice, int quantity) {
    }

    public static OrderResponse from(CustomerOrder o) {
        return new OrderResponse(
                o.getId(),
                o.getCustomerName(),
                o.getEmail(),
                o.getTotal(),
                o.getCreatedAt(),
                o.getItems().stream()
                        .map(i -> new Line(i.getProductId(), i.getProductName(), i.getUnitPrice(), i.getQuantity()))
                        .toList()
        );
    }
}
