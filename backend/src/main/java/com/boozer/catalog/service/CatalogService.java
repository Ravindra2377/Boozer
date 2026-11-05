package com.boozer.catalog.service;

import com.boozer.catalog.entity.ProductEntity;
import com.boozer.catalog.repository.ProductRepository;
import com.boozer.catalog.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CatalogService {

    private final ProductRepository productRepository;
    private final StockRepository stockRepository;

    public List<ProductEntity> getAllProducts(String category) {
        if (category != null && !category.isBlank() && !"ALL".equalsIgnoreCase(category)) {
            return productRepository.findByCategoryAndIsActiveTrue(category.toUpperCase());
        }
        return productRepository.findByIsActiveTrue();
    }

    public ProductEntity getProductById(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));
    }
}
