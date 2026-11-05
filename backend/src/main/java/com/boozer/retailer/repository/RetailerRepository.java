package com.boozer.retailer.repository;

import com.boozer.retailer.entity.RetailerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RetailerRepository extends JpaRepository<RetailerEntity, UUID> {
    List<RetailerEntity> findByLicenseStatusAndIsAcceptingOrdersTrue(String licenseStatus);
}
