package com.shop.controller;

import com.shop.model.Product;
import com.shop.service.ProductService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping
    public List<Product> list(@RequestParam(defaultValue = "") String category,
                              @RequestParam(defaultValue = "") String q,
                              @RequestParam(defaultValue = "featured") String sort) {
        return service.search(category, q, sort);
    }

    @GetMapping("/categories")
    public List<String> categories() {
        return service.categories();
    }

    @GetMapping("/{id}")
    public Product get(@PathVariable Long id) {
        return service.get(id);
    }
}
