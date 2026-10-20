package com.shop.service;

import com.shop.exception.NotFoundException;
import com.shop.model.Product;
import com.shop.repository.ProductRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository repo;

    public ProductService(ProductRepository repo) {
        this.repo = repo;
    }

    public List<Product> search(String category, String q, String sort) {
        String cat = category == null || category.equalsIgnoreCase("all") ? "" : category.trim();
        String query = q == null ? "" : q.trim();
        return repo.search(cat, query, toSort(sort));
    }

    public Product get(Long id) {
        return repo.findById(id).orElseThrow(() -> new NotFoundException("Product " + id + " not found"));
    }

    public List<String> categories() {
        return repo.findCategories();
    }

    private Sort toSort(String sort) {
        if (sort == null) sort = "";
        return switch (sort) {
            case "price_asc" -> Sort.by(Sort.Order.asc("price"), Sort.Order.asc("id"));
            case "price_desc" -> Sort.by(Sort.Order.desc("price"), Sort.Order.asc("id"));
            case "rating" -> Sort.by(Sort.Order.desc("rating"), Sort.Order.asc("id"));
            case "newest" -> Sort.by(Sort.Order.desc("id"));
            default -> Sort.by(Sort.Order.desc("featured"), Sort.Order.asc("id"));
        };
    }
}
