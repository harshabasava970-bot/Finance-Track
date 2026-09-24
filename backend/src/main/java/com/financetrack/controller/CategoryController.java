package com.financetrack.controller;

import com.financetrack.dto.request.CategoryRequest;
import com.financetrack.dto.response.ApiResponse;
import com.financetrack.dto.response.CategoryResponse;
import com.financetrack.entity.Category;
import com.financetrack.security.UserDetailsImpl;
import com.financetrack.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategories(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(required = false) String type) {

        List<CategoryResponse> categories;
        if (type != null && !type.isBlank()) {
            Category.TransactionType transactionType = Category.TransactionType.valueOf(type.toUpperCase());
            categories = categoryService.getCategoriesByType(userDetails.getId(), transactionType);
        } else {
            categories = categoryService.getAllCategoriesForUser(userDetails.getId());
        }

        return ResponseEntity.ok(ApiResponse.success("Categories retrieved", categories));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody CategoryRequest request) {
        CategoryResponse category = categoryService.createCustomCategory(userDetails.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category created", category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody CategoryRequest request) {
        boolean isAdmin = userDetails.getRole().equals("ADMIN");
        CategoryResponse category = categoryService.updateCategory(id, userDetails.getId(), request, isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Category updated", category));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        boolean isAdmin = userDetails.getRole().equals("ADMIN");
        categoryService.deleteCategory(id, userDetails.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Category deleted"));
    }
}
