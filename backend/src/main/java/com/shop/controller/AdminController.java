package com.shop.controller;

import com.shop.dto.AdminOrderResponse;
import com.shop.dto.ProductRequest;
import com.shop.model.Product;
import com.shop.repository.OrderRepository;
import com.shop.service.AdminProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** Everything under /api/admin requires the X-Admin-Key header (see AdminAuthInterceptor). */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminProductService products;
    private final OrderRepository orders;

    public AdminController(AdminProductService products, OrderRepository orders) {
        this.products = products;
        this.orders = orders;
    }

    /** Lets the login screen check a key without changing anything. */
    @GetMapping("/verify")
    public Map<String, Object> verify() {
        return Map.of("ok", true);
    }

    @PostMapping("/products")
    @ResponseStatus(HttpStatus.CREATED)
    public Product create(@Valid @RequestBody ProductRequest request) {
        return products.create(request);
    }

    @PutMapping("/products/{id}")
    public Product update(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return products.update(id, request);
    }

    @DeleteMapping("/products/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        products.delete(id);
    }

    @GetMapping("/orders")
    @Transactional(readOnly = true)
    public List<AdminOrderResponse> orders() {
        return orders.findAllWithItems().stream().map(AdminOrderResponse::from).toList();
    }
}
