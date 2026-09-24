package com.financetrack.service;

import com.financetrack.dto.response.UserResponse;
import com.financetrack.entity.User;
import com.financetrack.exception.ResourceNotFoundException;
import com.financetrack.repository.TransactionRepository;
import com.financetrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::from).toList();
    }

    public UserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse toggleUserActive(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setActive(!user.getActive());
        return UserResponse.from(userRepository.save(user));
    }

    public Map<String, Object> getSystemStats() {
        long totalUsers = userRepository.count();
        long totalTransactions = transactionRepository.count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalTransactions", totalTransactions);
        return stats;
    }
}
