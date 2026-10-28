package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.Category;
import com.ecommerce.backend.repository.CategoryRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository objCategoryRepository;

    @InjectMocks
    private CategoryService objCategoryService;

    // fCreateCategory : fabrique une catégorie de test
    // Reçoit : strName, le nom de la catégorie
    // Renvoie : la catégorie
    // Pourquoi : éviter de répéter la création dans chaque test
    private Category fCreateCategory(String strName) {
        Category objCategory = new Category();
        objCategory.setName(strName);
        return objCategory;
    }

    // fGetAllCategories_renvoieToutesLesCategories : vérifie que le service renvoie ce que le repository fournit
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : valider US1 (la liste des catégories est disponible)
    @Test
    void fGetAllCategories_renvoieToutesLesCategories() {
        List<Category> tbCategories = List.of(fCreateCategory("Homme"), fCreateCategory("Femme"));
        when(objCategoryRepository.findAll()).thenReturn(tbCategories);

        List<Category> tbResult = objCategoryService.fGetAllCategories();

        assertEquals(2, tbResult.size());
        assertEquals("Homme", tbResult.get(0).getName());
        verify(objCategoryRepository).findAll();
    }

    // fGetAllCategories_renvoieListeVideSiAucuneCategorie : vérifie le cas où il n'y a aucune catégorie
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : s'assurer qu'une liste vide est renvoyée sans erreur
    @Test
    void fGetAllCategories_renvoieListeVideSiAucuneCategorie() {
        when(objCategoryRepository.findAll()).thenReturn(List.of());

        List<Category> tbResult = objCategoryService.fGetAllCategories();

        assertTrue(tbResult.isEmpty());
    }
}
