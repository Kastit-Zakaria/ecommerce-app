package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepository objProductRepository;

    // ProductService : constructeur (nom imposé par Java), Spring injecte le repository
    // Reçoit : objProductRepository
    // Renvoie : rien
    // Pourquoi : donner au service accès à la table des produits
    public ProductService(ProductRepository objProductRepository) {
        this.objProductRepository = objProductRepository;
    }

    // fGetProductsByCategory : récupère les produits d'une catégorie
    // Reçoit : intCategoryId, l'identifiant de la catégorie
    // Renvoie : la liste des produits de cette catégorie
    // Pourquoi : afficher les produits de la catégorie choisie
    public List<Product> fGetProductsByCategory(Long intCategoryId) {
        return objProductRepository.findByCategoryId(intCategoryId);
    }

    // fGetProductById : récupère un produit par son identifiant
    // Reçoit : intId, l'identifiant du produit
    // Renvoie : le produit, ou une erreur 404 « Produit introuvable » s'il n'existe pas
    // Pourquoi : alimenter la fiche détaillée tout en signalant clairement un identifiant inconnu
    public Product fGetProductById(Long intId) {
        Optional<Product> objResult = objProductRepository.findById(intId);

        if (objResult.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Produit introuvable");
        }

        return objResult.get();
    }

    // fGetLatestProducts : récupère les 8 derniers produits ajoutés
    // Reçoit : rien
    // Renvoie : la liste des derniers produits
    // Pourquoi : remplir la section « Derniers arrivages » de l'accueil
    public List<Product> fGetLatestProducts() {
        return objProductRepository.findTop8ByOrderByIdDesc();
    }
}