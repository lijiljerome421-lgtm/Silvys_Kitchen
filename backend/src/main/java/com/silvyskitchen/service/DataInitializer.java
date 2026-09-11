package com.silvyskitchen.service;

import com.silvyskitchen.model.AdminUser;
import com.silvyskitchen.model.Product;
import com.silvyskitchen.model.Review;
import com.silvyskitchen.repository.AdminUserRepository;
import com.silvyskitchen.repository.ProductRepository;
import com.silvyskitchen.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Override
    public void run(String... args) throws Exception {
        // Seed default Admin User if not present
        if (adminUserRepository.findByUsername("admin").isEmpty()) {
            adminUserRepository.save(new AdminUser("admin", "silvy123"));
            System.out.println(">>> Seeded default admin user: admin / silvy123");
        }

        // Seed initial products if database is empty
        if (productRepository.count() == 0) {
            saveSeedProduct(
                    "Homemade Chicken Pickle",
                    "നാടൻ ചിക്കൻ അച്ചാർ",
                    "Traditional spicy Kerala chicken pickle prepared with tender chicken pieces, garlic, ginger, curry leaves, and hand-ground roasted spices in pure sesame oil.",
                    280.0,
                    "500g Jar",
                    "Pickles",
                    "seed-images/chicken_pickle.jpg",
                    true,
                    true,
                    "Made in small batches"
            );

            saveSeedProduct(
                    "Traditional Kerala Beef Pickle",
                    "നാടൻ ബീഫ് അച്ചാർ",
                    "Authentic slow-roasted beef pickle infused with caramelized shallots, fried garlic, dark spices, Kudampuli extract, and aromatic curry leaves.",
                    320.0,
                    "500g Jar",
                    "Pickles",
                    "seed-images/beef_pickle.jpg",
                    true,
                    true,
                    "Made in small batches"
            );

            saveSeedProduct(
                    "Naadan Fish Pickle (Meen Achar)",
                    "നാടൻ മീൻ അച്ചാർ",
                    "Fresh seer fish pieces fried crisp and preserved in dark spicy ginger-garlic gravy with coconut vinegar and toasted mustard seeds.",
                    350.0,
                    "500g Jar",
                    "Pickles",
                    "seed-images/fish_pickle.jpg",
                    true,
                    true,
                    "Made in small batches"
            );

            saveSeedProduct(
                    "Crispy Achappam (Rose Cookies)",
                    "അച്ചപ്പം",
                    "Traditional crunchy golden rose cookies handcrafted with rice flour, fresh coconut milk, black sesame seeds, and light cardamom.",
                    180.0,
                    "Pack of 20 Pcs",
                    "Snacks",
                    "seed-images/achappam.jpg",
                    true,
                    true,
                    "Freshly fried for orders"
            );

            saveSeedProduct(
                    "Traditional Kuzhalappam",
                    "കുഴലപ്പം",
                    "Crispy tube-shaped Kerala snack seasoned with cumin, garlic, and fried coconut flakes. Perfect for family gatherings & tea time.",
                    190.0,
                    "Pack of 25 Pcs",
                    "Snacks",
                    "seed-images/kuzhalappam.jpg",
                    true,
                    false,
                    "Freshly fried for orders"
            );

            saveSeedProduct(
                    "Golden Chakka Varuthath (Jackfruit Chips)",
                    "ചക്ക വറുത്തത്",
                    "Crispy thin slices of raw ripe jackfruit deep fried to perfection in pure coconut oil with a touch of salt.",
                    220.0,
                    "500g Pack",
                    "Snacks",
                    "seed-images/chakka_varuthath.jpg",
                    true,
                    true,
                    "Seasonal homemade special"
            );

            System.out.println(">>> Seeded authentic Silvy's Kitchen Pickles & Snacks with deployment-safe DB images.");
        }

        // Seed initial approved reviews if review table is empty
        if (reviewRepository.count() == 0) {
            reviewRepository.save(new Review(
                    "Anju",
                    5,
                    "The chicken pickle tasted just like something made at home. ❤️",
                    "Homemade Chicken Pickle",
                    true
            ));

            reviewRepository.save(new Review(
                    "Meera",
                    5,
                    "Ordered Achappam for my daughter's function. Everyone loved it!",
                    "Crispy Achappam (Rose Cookies)",
                    true
            ));

            reviewRepository.save(new Review(
                    "Thomas",
                    5,
                    "Authentic Kerala beef pickle. Excellent packaging and incredible flavor!",
                    "Traditional Kerala Beef Pickle",
                    true
            ));

            System.out.println(">>> Seeded initial authentic customer love notes.");
        }
    }

    private void saveSeedProduct(String name, String malayalamName, String description, Double price,
                                 String unit, String category, String seedImagePath, Boolean available,
                                 Boolean featured, String preparationTime) {
        Product p = new Product(name, malayalamName, description, price, unit, category, "", available, featured, preparationTime);
        try {
            ClassPathResource res = new ClassPathResource(seedImagePath);
            if (res.exists()) {
                try (InputStream is = res.getInputStream()) {
                    p.setImageData(is.readAllBytes());
                    p.setImageContentType("image/jpeg");
                }
            }
        } catch (Exception e) {
            System.err.println("Could not load seed image " + seedImagePath + ": " + e.getMessage());
        }
        Product saved = productRepository.save(p);
        saved.setImageUrl("/api/products/" + saved.getId() + "/image");
        productRepository.save(saved);
    }
}
