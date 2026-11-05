package com.boozer.retailer.controller;

import com.boozer.catalog.entity.StockEntity;
import com.boozer.common.dto.ApiResponse;
import com.boozer.orders.entity.OrderEntity;
import com.boozer.retailer.entity.RetailerEntity;
import com.boozer.retailer.service.RetailerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/retailer")
@RequiredArgsConstructor
public class RetailerController {

    private final RetailerService retailerService;

    @GetMapping("/info")
    public ResponseEntity<ApiResponse<RetailerEntity>> getInfo() {
        return ResponseEntity.ok(ApiResponse.success(retailerService.getDefaultRetailer()));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<OrderEntity>>> getOrders(
            @RequestParam(required = false) UUID retailerId
    ) {
        UUID id = retailerId != null ? retailerId : retailerService.getDefaultRetailer().getId();
        return ResponseEntity.ok(ApiResponse.success(retailerService.getRetailerOrders(id)));
    }

    @PatchMapping("/orders/{id}/accept")
    public ResponseEntity<ApiResponse<OrderEntity>> acceptOrder(
            @PathVariable UUID id,
            @RequestHeader(value = "X-Staff-Id", required = false) String staffId
    ) {
        UUID actor = staffId != null ? UUID.fromString(staffId) : UUID.randomUUID();
        return ResponseEntity.ok(ApiResponse.success("Order accepted", retailerService.acceptOrder(id, actor)));
    }

    @PatchMapping("/orders/{id}/pack")
    public ResponseEntity<ApiResponse<OrderEntity>> packOrder(
            @PathVariable UUID id,
            @RequestHeader(value = "X-Staff-Id", required = false) String staffId
    ) {
        UUID actor = staffId != null ? UUID.fromString(staffId) : UUID.randomUUID();
        return ResponseEntity.ok(ApiResponse.success("Order packed", retailerService.packOrder(id, actor)));
    }

    @PatchMapping("/orders/{id}/dispatch")
    public ResponseEntity<ApiResponse<OrderEntity>> dispatchOrder(
            @PathVariable UUID id,
            @RequestHeader(value = "X-Staff-Id", required = false) String staffId
    ) {
        UUID actor = staffId != null ? UUID.fromString(staffId) : UUID.randomUUID();
        return ResponseEntity.ok(ApiResponse.success("Order dispatched to delivery partner", retailerService.dispatchOrder(id, actor)));
    }

    @GetMapping("/stock")
    public ResponseEntity<ApiResponse<List<StockEntity>>> getStock(
            @RequestParam(required = false) UUID retailerId
    ) {
        UUID id = retailerId != null ? retailerId : retailerService.getDefaultRetailer().getId();
        return ResponseEntity.ok(ApiResponse.success(retailerService.getRetailerStock(id)));
    }

    @PatchMapping("/stock/{id}/toggle")
    public ResponseEntity<ApiResponse<StockEntity>> toggleStock(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Stock toggled", retailerService.toggleStock(id)));
    }
}
