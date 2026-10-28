package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;

// Repository utilisé uniquement par les tests pour insérer des marques (absent du code de production)
public interface BrandRepository extends JpaRepository<Brand, Long> {
}
