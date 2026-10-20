package com.shop.dto;

import com.shop.model.CustomerOrder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/** Full order detail including delivery contact. Only ever returned to authenticated admins. */
public record AdminOrderResponse(
        Long id,
        String customerName,
        String email,
        String phone,
        String address,
        String city,
        String postalCode,
        BigDecimal total,
        Instant createdAt,
        List<OrderResponse.Line> items
) {
    public static AdminOrderResponse from(CustomerOrder o) {
        return new AdminOrderResponse(
                o.getId(), o.getCustomerName(), o.getEmail(), o.getPhone(), o.getAddress(),
                o.getCity(), o.getPostalCode(), o.getTotal(), o.getCreatedAt(),
                o.getItems().stream()
                        .map(i -> new OrderResponse.Line(i.getProductId(), i.getProductName(), i.getUnitPrice(), i.getQuantity()))
                        .toList()
        );
    }
}
