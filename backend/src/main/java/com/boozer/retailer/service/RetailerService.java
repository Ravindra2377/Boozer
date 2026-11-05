package com.boozer.retailer.service;

import com.boozer.catalog.entity.StockEntity;
import com.boozer.catalog.repository.StockRepository;
import com.boozer.orders.domain.OrderStatus;
import com.boozer.orders.entity.OrderEntity;
import com.boozer.orders.repository.OrderRepository;
import com.boozer.orders.service.OrderService;
import com.boozer.retailer.entity.RetailerEntity;
import com.boozer.retailer.repository.RetailerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RetailerService {

    private final RetailerRepository retailerRepository;
    private final OrderRepository orderRepository;
    private final StockRepository stockRepository;
    private final OrderService orderService;

    public RetailerEntity getDefaultRetailer() {
        return retailerRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new IllegalStateException("No registered retailer found"));
    }

    public List<OrderEntity> getRetailerOrders(UUID retailerId) {
        return orderRepository.findByRetailerIdOrderByCreatedAtDesc(retailerId);
    }

    @Transactional
    public OrderEntity acceptOrder(UUID orderId, UUID staffId) {
        return orderService.transitionStatus(orderId, OrderStatus.ACCEPTED, false, staffId, "RETAILER_STAFF");
    }

    @Transactional
    public OrderEntity packOrder(UUID orderId, UUID staffId) {
        return orderService.transitionStatus(orderId, OrderStatus.PACKED, false, staffId, "RETAILER_STAFF");
    }

    @Transactional
    public OrderEntity dispatchOrder(UUID orderId, UUID staffId) {
        return orderService.transitionStatus(orderId, OrderStatus.DISPATCHED, false, staffId, "RETAILER_STAFF");
    }

    public List<StockEntity> getRetailerStock(UUID retailerId) {
        return stockRepository.findByRetailerIdAndIsInStockTrue(retailerId);
    }

    @Transactional
    public StockEntity toggleStock(UUID stockId) {
        StockEntity stock = stockRepository.findById(stockId)
                .orElseThrow(() -> new IllegalArgumentException("Stock item not found: " + stockId));
        stock.setIsInStock(!stock.getIsInStock());
        return stockRepository.save(stock);
    }
}
