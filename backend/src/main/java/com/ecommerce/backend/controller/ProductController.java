package com.ecommerce.backend.controller;

import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.service.ProductService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService objProductService;

    // ProductController : constructeur (nom imposé par Java), Spring injecte le service
    // Reçoit : objProductService
    // Renvoie : rien
    // Pourquoi : donner au contrôleur accès aux produits
    public ProductController(ProductService objProductService) {
        this.objProductService = objProductService;
    }

    // fGetLatest : liste les derniers produits ajoutés (GET /api/products/latest)
    // Reçoit : rien
    // Renvoie : la liste des derniers arrivages
    // Pourquoi : remplir la section « Derniers arrivages » de l'accueil
    @GetMapping("/latest")
    public List<Product> fGetLatest() {
        return objProductService.fGetLatestProducts();
    }

    // fGetById : renvoie un produit (GET /api/products/{id})
    // Reçoit : intId, l'identifiant du produit
    // Renvoie : le produit demandé
    // Pourquoi : afficher la fiche détaillée dans le modal
    @GetMapping("/{id}")
    public Product fGetById(@PathVariable("id") Long intId) {
        return objProductService.fGetProductById(intId);
    }
}