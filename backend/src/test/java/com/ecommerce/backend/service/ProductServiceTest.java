package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository objProductRepository;

    @InjectMocks
    private ProductService objProductService;

    // fCreateProduct : fabrique un produit de test
    // Reçoit : strName, le nom du produit
    // Renvoie : le produit
    // Pourquoi : éviter de répéter la création dans chaque test
    private Product fCreateProduct(String strName) {
        Product objProduct = new Product();
        objProduct.setName(strName);
        return objProduct;
    }

    // fGetProductsByCategory_renvoieLesProduitsDeLaCategorie : vérifie la liste des produits d'une catégorie
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : valider US2 (produits d'une catégorie)
    @Test
    void fGetProductsByCategory_renvoieLesProduitsDeLaCategorie() {
        List<Product> tbProducts = List.of(fCreateProduct("Polo"), fCreateProduct("Chemise"));
        when(objProductRepository.findByCategoryId(1L)).thenReturn(tbProducts);

        List<Product> tbResult = objProductService.fGetProductsByCategory(1L);

        assertEquals(2, tbResult.size());
        verify(objProductRepository).findByCategoryId(1L);
    }

    // fGetProductsByCategory_renvoieListeVideSiCategorieSansProduit : vérifie une catégorie vide
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : valider US2 (message « catégorie vide » côté front)
    @Test
    void fGetProductsByCategory_renvoieListeVideSiCategorieSansProduit() {
        when(objProductRepository.findByCategoryId(2L)).thenReturn(List.of());

        List<Product> tbResult = objProductService.fGetProductsByCategory(2L);

        assertTrue(tbResult.isEmpty());
    }

    // fGetProductById_renvoieLeProduitExistant : vérifie la récupération d'un produit existant
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : valider US3 (détail d'un produit)
    @Test
    void fGetProductById_renvoieLeProduitExistant() {
        Product objProduct = fCreateProduct("Polo");
        when(objProductRepository.findById(1L)).thenReturn(Optional.of(objProduct));

        Product objResult = objProductService.fGetProductById(1L);

        assertSame(objProduct, objResult);
    }

    // fGetProductById_leveUneErreur404SiProduitInexistant : vérifie l'erreur pour un id inconnu
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : garantir une réponse 404 « Produit introuvable »
    @Test
    void fGetProductById_leveUneErreur404SiProduitInexistant() {
        when(objProductRepository.findById(999L)).thenReturn(Optional.empty());

        ResponseStatusException objException = assertThrows(
                ResponseStatusException.class,
                () -> objProductService.fGetProductById(999L)
        );

        assertEquals(HttpStatus.NOT_FOUND, objException.getStatusCode());
        assertEquals("Produit introuvable", objException.getReason());
    }

    // fGetLatestProducts_renvoieLesDerniersProduits : vérifie les derniers arrivages
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : s'assurer que le service délègue bien au repository
    @Test
    void fGetLatestProducts_renvoieLesDerniersProduits() {
        List<Product> tbProducts = List.of(fCreateProduct("Polo"));
        when(objProductRepository.findTop8ByOrderByIdDesc()).thenReturn(tbProducts);

        List<Product> tbResult = objProductService.fGetLatestProducts();

        assertEquals(1, tbResult.size());
        verify(objProductRepository).findTop8ByOrderByIdDesc();
    }
}
