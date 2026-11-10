package com.boozer.deliveries.service;

import com.boozer.deliveries.entity.DeliveryEntity;
import com.boozer.deliveries.repository.DeliveryRepository;
import com.boozer.orders.domain.OrderStatus;
import com.boozer.orders.entity.OrderEntity;
import com.boozer.orders.repository.OrderRepository;
import com.boozer.orders.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final OrderRepository orderRepository;
    private final OrderService orderService;

    private final Map<UUID, List<SseEmitter>> orderEmitters = new ConcurrentHashMap<>();

    public DeliveryEntity getDeliveryForOrder(UUID orderId) {
        return deliveryRepository.findByOrderId(orderId).orElseGet(() -> {
            OrderEntity order = orderRepository.findById(orderId).orElse(null);
            if (order == null) return null;

            DeliveryEntity fallback = DeliveryEntity.builder()
                    .order(order)
                    .riderName("Rohit Kumar")
                    .riderPhone("+91 98490 28192")
                    .riderLat(new BigDecimal("17.4339"))
                    .riderLng(new BigDecimal("78.3978"))
                    .status("IN_TRANSIT")
                    .doorstepOtp("4819")
                    .riderLocationUpdatedAt(OffsetDateTime.now())
                    .build();
            return deliveryRepository.save(fallback);
        });
    }

    public DeliveryEntity getDeliveryById(UUID deliveryId) {
        return deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new IllegalArgumentException("Delivery not found: " + deliveryId));
    }

    @Transactional
    public DeliveryEntity updateRiderLocation(
            UUID orderId,
            BigDecimal lat,
            BigDecimal lng,
            BigDecimal speedKmh,
            BigDecimal headingDegrees
    ) {
        DeliveryEntity delivery = getDeliveryForOrder(orderId);
        if (delivery == null) {
            throw new IllegalArgumentException("No delivery associated with order: " + orderId);
        }

        if ("DELIVERED".equals(delivery.getStatus()) || "CANCELLED".equals(delivery.getStatus())) {
            throw new IllegalStateException("Delivery is already " + delivery.getStatus() + ". Location tracking is inactive.");
        }

        delivery.setRiderLat(lat);
        delivery.setRiderLng(lng);
        if (speedKmh != null) delivery.setRiderSpeedKmh(speedKmh);
        if (headingDegrees != null) delivery.setRiderHeadingDegrees(headingDegrees);
        delivery.setRiderLocationUpdatedAt(OffsetDateTime.now());

        DeliveryEntity saved = deliveryRepository.save(delivery);
        broadcastTelemetry(orderId, saved);

        return saved;
    }

    public void registerEmitter(UUID orderId, SseEmitter emitter) {
        orderEmitters.computeIfAbsent(orderId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(orderId, emitter));
        emitter.onTimeout(() -> removeEmitter(orderId, emitter));
        emitter.onError(e -> removeEmitter(orderId, emitter));

        DeliveryEntity current = deliveryRepository.findByOrderId(orderId).orElse(null);
        if (current != null) {
            try {
                emitter.send(SseEmitter.event()
                        .name("INIT_TELEMETRY")
                        .data(buildTelemetryPayload(current)));
            } catch (Exception ex) {
                removeEmitter(orderId, emitter);
            }
        }
    }

    private void removeEmitter(UUID orderId, SseEmitter emitter) {
        List<SseEmitter> list = orderEmitters.get(orderId);
        if (list != null) {
            list.remove(emitter);
            if (list.isEmpty()) {
                orderEmitters.remove(orderId);
            }
        }
    }

    private void broadcastTelemetry(UUID orderId, DeliveryEntity delivery) {
        List<SseEmitter> emitters = orderEmitters.get(orderId);
        if (emitters == null || emitters.isEmpty()) return;

        Map<String, Object> payload = buildTelemetryPayload(delivery);

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("RIDER_LOCATION")
                        .data(payload));
            } catch (Exception e) {
                removeEmitter(orderId, emitter);
            }
        }
    }

    private Map<String, Object> buildTelemetryPayload(DeliveryEntity delivery) {
        Map<String, Object> data = new HashMap<>();
        data.put("orderId", delivery.getOrder() != null ? delivery.getOrder().getId() : null);
        data.put("deliveryId", delivery.getId());
        data.put("status", delivery.getStatus());
        data.put("riderName", delivery.getRiderName());
        data.put("riderPhone", delivery.getRiderPhone());
        data.put("lat", delivery.getRiderLat());
        data.put("lng", delivery.getRiderLng());
        data.put("speedKmh", delivery.getRiderSpeedKmh());
        data.put("headingDegrees", delivery.getRiderHeadingDegrees());
        data.put("updatedAt", delivery.getRiderLocationUpdatedAt() != null
                ? delivery.getRiderLocationUpdatedAt().toString()
                : OffsetDateTime.now().toString());
        return data;
    }

    @Transactional
    public boolean verifyDoorstepAgeCheck(UUID orderId, String otp) {
        DeliveryEntity delivery = getDeliveryForOrder(orderId);
        if (delivery == null) {
            throw new IllegalArgumentException("No delivery associated with order: " + orderId);
        }

        if (!delivery.getDoorstepOtp().equals(otp)) {
            log.warn("Doorstep OTP verification failed for order {}: provided={}", orderId, otp);
            return false;
        }

        delivery.setStatus("AGE_VERIFIED");
        delivery.setDeliveredAt(OffsetDateTime.now());
        deliveryRepository.save(delivery);

        // Transition through OrderStateMachine to AGE_CHECKED and DELIVERED
        orderService.transitionStatus(orderId, OrderStatus.ARRIVED, false, orderId, "DELIVERY_PARTNER");
        orderService.transitionStatus(orderId, OrderStatus.AGE_CHECKED, true, orderId, "DELIVERY_PARTNER");
        orderService.transitionStatus(orderId, OrderStatus.DELIVERED, true, orderId, "DELIVERY_PARTNER");

        // Teardown live location streaming when delivery is completed
        List<SseEmitter> emitters = orderEmitters.remove(orderId);
        if (emitters != null) {
            for (SseEmitter emitter : emitters) {
                try {
                    emitter.send(SseEmitter.event().name("DELIVERY_COMPLETED").data("Order successfully delivered"));
                    emitter.complete();
                } catch (Exception ignored) {}
            }
        }

        log.info("Doorstep age check successfully verified and order {} marked DELIVERED", orderId);
        return true;
    }
}
