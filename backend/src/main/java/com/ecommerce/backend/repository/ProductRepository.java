package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // findByCategoryId : requête déduite du nom par Spring Data (nom imposé, ne pas renommer)
    // Reçoit : intCategoryId, l'identifiant de la catégorie
    // Renvoie : les produits de cette catégorie
    // Pourquoi : lister les produits d'une catégorie
    List<Product> findByCategoryId(Long intCategoryId);

    // findTop8ByOrderByIdDesc : requête déduite du nom par Spring Data (nom imposé, ne pas renommer)
    // Reçoit : rien
    // Renvoie : les 8 produits les plus récents (id décroissant)
    // Pourquoi : alimenter les derniers arrivages
    List<Product> findTop8ByOrderByIdDesc();
}