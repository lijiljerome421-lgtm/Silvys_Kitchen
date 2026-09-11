package com.silvyskitchen.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Product name is required")
    private String name;

    private String malayalamName;

    @Column(length = 1000)
    private String description;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private Double price;

    private String unit;

    @NotBlank(message = "Category is required")
    private String category;

    private String imageUrl;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @Lob
    @Column(name = "image_data", length = 100000000)
    private byte[] imageData;

    private String imageContentType;

    private Boolean available = true;

    private Boolean featured = false;

    private String preparationTime;

    public Product() {}

    public Product(String name, String malayalamName, String description, Double price, String unit, String category, String imageUrl, Boolean available, Boolean featured, String preparationTime) {
        this.name = name;
        this.malayalamName = malayalamName;
        this.description = description;
        this.price = price;
        this.unit = unit;
        this.category = category;
        this.imageUrl = imageUrl;
        this.available = available != null ? available : true;
        this.featured = featured != null ? featured : false;
        this.preparationTime = preparationTime;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getMalayalamName() { return malayalamName; }
    public void setMalayalamName(String malayalamName) { this.malayalamName = malayalamName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Boolean getAvailable() { return available; }
    public void setAvailable(Boolean available) { this.available = available; }

    public Boolean getFeatured() { return featured; }
    public void setFeatured(Boolean featured) { this.featured = featured; }

    public String getPreparationTime() { return preparationTime; }
    public void setPreparationTime(String preparationTime) { this.preparationTime = preparationTime; }

    public byte[] getImageData() { return imageData; }
    public void setImageData(byte[] imageData) { this.imageData = imageData; }

    public String getImageContentType() { return imageContentType; }
    public void setImageContentType(String imageContentType) { this.imageContentType = imageContentType; }
}
