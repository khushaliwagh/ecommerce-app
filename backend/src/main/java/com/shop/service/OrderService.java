package com.shop.service;

import com.shop.dto.OrderItemRequest;
import com.shop.dto.OrderRequest;
import com.shop.dto.OrderResponse;
import com.shop.event.PurchaseEvent;
import com.shop.event.StockChangedEvent;
import com.shop.exception.InsufficientStockException;
import com.shop.exception.NotFoundException;
import com.shop.model.CustomerOrder;
import com.shop.model.OrderItem;
import com.shop.model.Product;
import com.shop.repository.OrderRepository;
import com.shop.repository.ProductRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;
import java.util.TreeMap;

@Service
public class OrderService {

    private final ProductRepository products;
    private final OrderRepository orders;
    private final ApplicationEventPublisher events;

    public OrderService(ProductRepository products, OrderRepository orders, ApplicationEventPublisher events) {
        this.products = products;
        this.orders = orders;
        this.events = events;
    }

    @Transactional
    public OrderResponse place(OrderRequest req) {
        // Merge duplicate lines; TreeMap gives a stable lock order (avoids deadlocks).
        Map<Long, Integer> wanted = new TreeMap<>();
        for (OrderItemRequest line : req.items()) {
            wanted.merge(line.productId(), line.quantity(), Integer::sum);
        }

        CustomerOrder order = new CustomerOrder();
        order.setCustomerName(req.customerName().trim());
        order.setEmail(req.email().trim().toLowerCase());
        order.setPhone(req.phone());
        order.setAddress(req.address().trim());
        order.setCity(req.city().trim());
        order.setPostalCode(req.postalCode());

        BigDecimal total = BigDecimal.ZERO;

        for (Map.Entry<Long, Integer> e : wanted.entrySet()) {
            Product p = products.findByIdForUpdate(e.getKey())
                    .orElseThrow(() -> new NotFoundException("Product " + e.getKey() + " no longer exists"));
            int qty = e.getValue();

            if (p.getStock() < qty) {
                String msg = p.getStock() == 0
                        ? p.getName() + " just sold out"
                        : "Only " + p.getStock() + " left of " + p.getName();
                throw new InsufficientStockException(msg);
            }

            p.setStock(p.getStock() - qty);

            OrderItem item = new OrderItem();
            item.setProductId(p.getId());
            item.setProductName(p.getName());
            item.setUnitPrice(p.getPrice());
            item.setQuantity(qty);
            order.addItem(item);

            total = total.add(p.getPrice().multiply(BigDecimal.valueOf(qty)));

            // Delivered to browsers only after this transaction commits (see StockBroadcaster).
            events.publishEvent(new StockChangedEvent(p.getId(), p.getStock()));
            events.publishEvent(new PurchaseEvent(p.getId(), p.getName(), qty, order.getCity()));
        }

        order.setTotal(total);
        return OrderResponse.from(orders.save(order));
    }
}
