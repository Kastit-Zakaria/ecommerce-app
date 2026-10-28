package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.Category;
import com.ecommerce.backend.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository objCategoryRepository;

    // CategoryService : constructeur (nom imposé par Java), Spring injecte le repository
    // Reçoit : objCategoryRepository
    // Renvoie : rien
    // Pourquoi : donner au service accès à la table des catégories
    public CategoryService(CategoryRepository objCategoryRepository) {
        this.objCategoryRepository = objCategoryRepository;
    }

    // fGetAllCategories : récupère toutes les catégories
    // Reçoit : rien
    // Renvoie : la liste des catégories
    // Pourquoi : isoler l'accès aux données du contrôleur
    public List<Category> fGetAllCategories() {
        return objCategoryRepository.findAll();
    }
}