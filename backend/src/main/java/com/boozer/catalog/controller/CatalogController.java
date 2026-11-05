package com.boozer.catalog.controller;

import com.boozer.catalog.entity.ProductEntity;
import com.boozer.catalog.service.CatalogService;
import com.boozer.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/catalog")
@RequiredArgsConstructor
public class CatalogController {

    private final CatalogService catalogService;

    @GetMapping("/products")
    public ResponseEntity<ApiResponse<List<ProductEntity>>> getProducts(
            @RequestParam(required = false) String category
    ) {
        List<ProductEntity> products = catalogService.getAllProducts(category);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<ApiResponse<ProductEntity>> getProductById(@PathVariable UUID id) {
        ProductEntity product = catalogService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success(product));
    }
}
