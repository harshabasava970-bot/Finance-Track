package com.financetrack.controller;

import com.financetrack.dto.request.CategoryRequest;
import com.financetrack.dto.response.ApiResponse;
import com.financetrack.dto.response.CategoryResponse;
import com.financetrack.dto.response.UserResponse;
import com.financetrack.security.UserDetailsImpl;
import com.financetrack.service.AdminService;
import com.financetrack.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final CategoryService categoryService;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success("Users retrieved", adminService.getAllUsers()));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("User retrieved", adminService.getUserById(id)));
    }

    @PatchMapping("/users/{id}/toggle-active")
    public ResponseEntity<ApiResponse<UserResponse>> toggleUserActive(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("User status updated", adminService.toggleUserActive(id)));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        return ResponseEntity.ok(ApiResponse.success("Stats retrieved", adminService.getSystemStats()));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getSystemCategories() {
        return ResponseEntity.ok(ApiResponse.success("System categories retrieved",
                categoryService.getAllSystemCategories()));
    }

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<CategoryResponse>> createSystemCategory(
            @Valid @RequestBody CategoryRequest request) {
        CategoryResponse category = categoryService.createSystemCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("System category created", category));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateSystemCategory(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody CategoryRequest request) {
        CategoryResponse category = categoryService.updateCategory(id, userDetails.getId(), request, true);
        return ResponseEntity.ok(ApiResponse.success("Category updated", category));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSystemCategory(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        categoryService.deleteCategory(id, userDetails.getId(), true);
        return ResponseEntity.ok(ApiResponse.success("Category deleted"));
    }
}
