package com.ecommerce.backend.controller;

import com.ecommerce.backend.entity.Brand;
import com.ecommerce.backend.entity.Category;
import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.repository.BrandRepository;
import com.ecommerce.backend.repository.CategoryRepository;
import com.ecommerce.backend.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Tests d'intégration des routes de l'API (base H2 en mémoire, voir src/test/resources)
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ApiIntegrationTest {

    @Autowired
    private MockMvc objMockMvc;

    @Autowired
    private CategoryRepository objCategoryRepository;

    @Autowired
    private ProductRepository objProductRepository;

    @Autowired
    private BrandRepository objBrandRepository;

    private Category objCategoryWithProduct;
    private Category objEmptyCategory;
    private Product objProduct;

    // fSetUp : insère les données de test avant chaque test
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : disposer d'une catégorie avec un produit et d'une catégorie vide (annulé après chaque test)
    @BeforeEach
    void fSetUp() {
        Brand objBrand = new Brand();
        objBrand.setName("Marque Test");
        objBrand = objBrandRepository.save(objBrand);

        objCategoryWithProduct = new Category();
        objCategoryWithProduct.setName("Homme");
        objCategoryWithProduct = objCategoryRepository.save(objCategoryWithProduct);

        objEmptyCategory = new Category();
        objEmptyCategory.setName("Vide");
        objEmptyCategory = objCategoryRepository.save(objEmptyCategory);

        objProduct = new Product();
        objProduct.setName("Polo");
        objProduct.setPrice(new BigDecimal("64.90"));
        objProduct.setStock(5);
        objProduct.setImageUrl("/images/polo.jpg");
        objProduct.setCategory(objCategoryWithProduct);
        objProduct.setBrand(objBrand);
        objProduct = objProductRepository.save(objProduct);
    }

    // fGetCategories_renvoieLesCategories : GET /api/categories
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : valider US1 (liste des catégories)
    @Test
    void fGetCategories_renvoieLesCategories() throws Exception {
        objMockMvc.perform(get("/api/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Homme"));
    }

    // fGetCategoryProducts_renvoieLesProduits : GET /api/categories/{id}/products
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : valider US2 (produits d'une catégorie)
    @Test
    void fGetCategoryProducts_renvoieLesProduits() throws Exception {
        objMockMvc.perform(get("/api/categories/{id}/products", objCategoryWithProduct.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Polo"));
    }

    // fGetCategoryProducts_renvoieListeVideSiCategorieSansProduit : catégorie sans produit
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : valider US2 (liste vide, pas d'erreur)
    @Test
    void fGetCategoryProducts_renvoieListeVideSiCategorieSansProduit() throws Exception {
        objMockMvc.perform(get("/api/categories/{id}/products", objEmptyCategory.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    // fGetProduct_renvoieLeDetail : GET /api/products/{id}
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : valider US3 (nom, marque, prix, image)
    @Test
    void fGetProduct_renvoieLeDetail() throws Exception {
        objMockMvc.perform(get("/api/products/{id}", objProduct.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Polo"))
                .andExpect(jsonPath("$.brand.name").value("Marque Test"))
                .andExpect(jsonPath("$.price").value(64.90))
                .andExpect(jsonPath("$.imageUrl").value("/images/polo.jpg"));
    }

    // fGetProduct_renvoie404SiIdInexistant : id inconnu
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : valider la réponse 404
    @Test
    void fGetProduct_renvoie404SiIdInexistant() throws Exception {
        objMockMvc.perform(get("/api/products/{id}", 999999L))
                .andExpect(status().isNotFound());
    }

    // fGetLatest_renvoieLesDerniersProduits : GET /api/products/latest
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : valider la section « Derniers arrivages »
    @Test
    void fGetLatest_renvoieLesDerniersProduits() throws Exception {
        objMockMvc.perform(get("/api/products/latest"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Polo"));
    }
}
