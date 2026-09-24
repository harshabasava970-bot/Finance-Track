package com.financetrack.service;

import com.financetrack.dto.request.CategoryRequest;
import com.financetrack.dto.response.CategoryResponse;
import com.financetrack.entity.Category;
import com.financetrack.entity.User;
import com.financetrack.exception.BadRequestException;
import com.financetrack.exception.ResourceNotFoundException;
import com.financetrack.exception.UnauthorizedException;
import com.financetrack.repository.CategoryRepository;
import com.financetrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public List<CategoryResponse> getAllCategoriesForUser(Long userId) {
        return categoryRepository.findAllAvailableForUser(userId)
                .stream().map(CategoryResponse::from).toList();
    }

    public List<CategoryResponse> getCategoriesByType(Long userId, Category.TransactionType type) {
        return categoryRepository.findAllAvailableForUserByType(userId, type)
                .stream().map(CategoryResponse::from).toList();
    }

    public List<CategoryResponse> getAllSystemCategories() {
        return categoryRepository.findBySystemCategoryTrue()
                .stream().map(CategoryResponse::from).toList();
    }

    @Transactional
    public CategoryResponse createCustomCategory(Long userId, CategoryRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Category category = Category.builder()
                .name(request.getName())
                .type(request.getType())
                .user(user)
                .systemCategory(false)
                .build();

        return CategoryResponse.from(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse createSystemCategory(CategoryRequest request) {
        if (categoryRepository.existsByNameAndSystemCategoryTrue(request.getName())) {
            throw new BadRequestException("System category with this name already exists");
        }

        Category category = Category.builder()
                .name(request.getName())
                .type(request.getType())
                .systemCategory(true)
                .build();

        return CategoryResponse.from(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse updateCategory(Long categoryId, Long userId, CategoryRequest request, boolean isAdmin) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (!isAdmin && (category.getSystemCategory() || !category.getUser().getId().equals(userId))) {
            throw new UnauthorizedException("You can only edit your own categories");
        }

        category.setName(request.getName());
        category.setType(request.getType());
        return CategoryResponse.from(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Long categoryId, Long userId, boolean isAdmin) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (!isAdmin && (category.getSystemCategory() || !category.getUser().getId().equals(userId))) {
            throw new UnauthorizedException("You can only delete your own categories");
        }

        categoryRepository.delete(category);
    }
}
