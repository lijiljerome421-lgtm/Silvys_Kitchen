package com.silvyskitchen.controller;

import com.silvyskitchen.model.Review;
import com.silvyskitchen.repository.ReviewRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    // Public API: Get all approved customer reviews for customer website
    @GetMapping("/reviews")
    public ResponseEntity<List<Review>> getApprovedReviews() {
        return ResponseEntity.ok(reviewRepository.findByApprovedTrueOrderByCreatedAtDesc());
    }

    // Public API: Submit new customer review (Pending approval)
    @PostMapping("/reviews")
    public ResponseEntity<Review> submitReview(@Valid @RequestBody Review review) {
        review.setApproved(false);
        review.setCreatedAt(LocalDateTime.now());
        Review saved = reviewRepository.save(review);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // Admin API: Get all reviews (Pending, Approved, Hidden)
    @GetMapping("/admin/reviews")
    public ResponseEntity<List<Review>> getAllReviewsAdmin() {
        return ResponseEntity.ok(reviewRepository.findAllByOrderByCreatedAtDesc());
    }

    // Admin API: Approve review
    @PatchMapping("/admin/reviews/{id}/approve")
    public ResponseEntity<Review> approveReview(@PathVariable Long id) {
        return reviewRepository.findById(id).map(review -> {
            review.setApproved(true);
            return ResponseEntity.ok(reviewRepository.save(review));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Admin API: Hide review
    @PatchMapping("/admin/reviews/{id}/hide")
    public ResponseEntity<Review> hideReview(@PathVariable Long id) {
        return reviewRepository.findById(id).map(review -> {
            review.setApproved(false);
            return ResponseEntity.ok(reviewRepository.save(review));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Admin API: Delete review
    @DeleteMapping("/admin/reviews/{id}")
    public ResponseEntity<Map<String, String>> deleteReview(@PathVariable Long id) {
        if (reviewRepository.existsById(id)) {
            reviewRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Review deleted successfully"));
        }
        return ResponseEntity.notFound().build();
    }
}
