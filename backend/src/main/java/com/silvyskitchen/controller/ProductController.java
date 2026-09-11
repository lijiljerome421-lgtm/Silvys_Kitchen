package com.silvyskitchen.controller;

import com.silvyskitchen.model.Product;
import com.silvyskitchen.repository.ProductRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    // Public API: Get active/available products for customer website
    @GetMapping
    public ResponseEntity<List<Product>> getAvailableProducts(@RequestParam(required = false) String category) {
        if (category != null && !category.equalsIgnoreCase("All")) {
            return ResponseEntity.ok(productRepository.findByCategoryAndAvailableTrue(category));
        }
        return ResponseEntity.ok(productRepository.findByAvailableTrue());
    }

    // Public API: Get featured products for homepage hero
    @GetMapping("/featured")
    public ResponseEntity<List<Product>> getFeaturedProducts() {
        return ResponseEntity.ok(productRepository.findByFeaturedTrueAndAvailableTrue());
    }

    // Public API: Get single product by ID
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Public API: Get product image byte stream directly from database
    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getProductImage(@PathVariable Long id) {
        return productRepository.findById(id)
                .filter(p -> p.getImageData() != null && p.getImageData().length > 0)
                .map(p -> {
                    String contentType = p.getImageContentType() != null ? p.getImageContentType() : "image/jpeg";
                    return ResponseEntity.ok()
                            .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                            .header(org.springframework.http.HttpHeaders.CACHE_CONTROL, "max-age=86400")
                            .body(p.getImageData());
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Admin API: Upload/replace product image stored in PostgreSQL database
    @RequestMapping(value = "/{id}/image", method = {RequestMethod.POST, RequestMethod.PUT})
    public ResponseEntity<?> uploadProductImage(
            @PathVariable Long id,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "File parameter is missing or empty"));
        }
        return productRepository.findById(id).map(product -> {
            try {
                byte[] bytes = file.getBytes();
                String contentType = file.getContentType();
                if (contentType == null || contentType.isEmpty()) {
                    contentType = "image/jpeg";
                }
                product.setImageData(bytes);
                product.setImageContentType(contentType);
                product.setImageUrl("/api/products/" + id + "/image");
                Product saved = productRepository.save(product);
                System.out.println(">>> Successfully uploaded " + bytes.length + " bytes for Product ID " + id);
                return ResponseEntity.ok(saved);
            } catch (Exception e) {
                System.err.println(">>> Error uploading product image for ID " + id + ": " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message", "Failed to upload image: " + e.getMessage()));
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    // Admin API: Get all products (including unavailable ones)
    @GetMapping("/admin/all")
    public ResponseEntity<List<Product>> getAllProductsAdmin() {
        return ResponseEntity.ok(productRepository.findAll());
    }

    // Admin API: Create new product
    @PostMapping
    public ResponseEntity<Product> createProduct(@Valid @RequestBody Product product) {
        Product saved = productRepository.save(product);
        if (saved.getImageUrl() == null || saved.getImageUrl().trim().isEmpty()) {
            saved.setImageUrl("/api/products/" + saved.getId() + "/image");
            saved = productRepository.save(saved);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // Admin API: Update existing product
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @Valid @RequestBody Product updatedProduct) {
        return productRepository.findById(id).map(existing -> {
            existing.setName(updatedProduct.getName());
            existing.setMalayalamName(updatedProduct.getMalayalamName());
            existing.setDescription(updatedProduct.getDescription());
            existing.setPrice(updatedProduct.getPrice());
            existing.setUnit(updatedProduct.getUnit());
            existing.setCategory(updatedProduct.getCategory());
            existing.setImageUrl(updatedProduct.getImageUrl());
            existing.setAvailable(updatedProduct.getAvailable());
            existing.setFeatured(updatedProduct.getFeatured());
            existing.setPreparationTime(updatedProduct.getPreparationTime());
            return ResponseEntity.ok(productRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Admin API: Quick toggle availability (In Stock / Out of Stock)
    @PatchMapping("/{id}/toggle-availability")
    public ResponseEntity<Product> toggleAvailability(@PathVariable Long id) {
        return productRepository.findById(id).map(product -> {
            product.setAvailable(!product.getAvailable());
            return ResponseEntity.ok(productRepository.save(product));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Admin API: Quick toggle featured status
    @PatchMapping("/{id}/toggle-featured")
    public ResponseEntity<Product> toggleFeatured(@PathVariable Long id) {
        return productRepository.findById(id).map(product -> {
            product.setFeatured(!product.getFeatured());
            return ResponseEntity.ok(productRepository.save(product));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Admin API: Delete product
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteProduct(@PathVariable Long id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Product deleted successfully"));
        }
        return ResponseEntity.notFound().build();
    }
}
