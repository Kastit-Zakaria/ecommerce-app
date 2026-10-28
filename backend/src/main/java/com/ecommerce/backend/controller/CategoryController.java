package com.ecommerce.backend.controller;

import com.ecommerce.backend.entity.Category;
import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.service.CategoryService;
import com.ecommerce.backend.service.ProductService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService objCategoryService;
    private final ProductService objProductService;

    // CategoryController : constructeur (nom imposé par Java), Spring injecte les services
    // Reçoit : objCategoryService et objProductService
    // Renvoie : rien
    // Pourquoi : donner au contrôleur accès aux catégories et aux produits
    public CategoryController(CategoryService objCategoryService, ProductService objProductService) {
        this.objCategoryService = objCategoryService;
        this.objProductService = objProductService;
    }

    // fGetAll : liste toutes les catégories (GET /api/categories)
    // Reçoit : rien
    // Renvoie : la liste des catégories
    // Pourquoi : alimenter la navigation et la section « Nos univers »
    @GetMapping
    public List<Category> fGetAll() {
        return objCategoryService.fGetAllCategories();
    }

    // fGetProducts : liste les produits d'une catégorie (GET /api/categories/{id}/products)
    // Reçoit : intId, l'identifiant de la catégorie
    // Renvoie : la liste des produits de cette catégorie
    // Pourquoi : afficher les produits de la catégorie choisie
    @GetMapping("/{id}/products")
    public List<Product> fGetProducts(@PathVariable("id") Long intId) {
        return objProductService.fGetProductsByCategory(intId);
    }
}