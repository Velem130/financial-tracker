package com.issa.velem.service;

import com.issa.velem.entity.Transaction;
import com.issa.velem.entity.User;
import com.issa.velem.repository.TransactionRepository;
import com.issa.velem.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public TransactionService(TransactionRepository transactionRepository, UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    public Transaction addTransaction(UUID userId, Transaction transaction) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        if (transaction.getMonthYear() == null || transaction.getMonthYear().isBlank()) {
            transaction.setMonthYear(getCurrentMonthYear());
        }

        transaction.setUser(userOpt.get());
        return transactionRepository.save(transaction);
    }

    public List<Transaction> getTransactionsForMonth(UUID userId, String monthYear) {
        return transactionRepository.findByUserIdAndMonthYear(userId, monthYear);
    }

    public BigDecimal getMonthlyIncome(UUID userId, String monthYear) {
        return transactionRepository.sumIncomeByUserIdAndMonthYear(userId, monthYear);
    }

    public BigDecimal getMonthlyExpenses(UUID userId, String monthYear) {
        return transactionRepository.sumExpensesByUserIdAndMonthYear(userId, monthYear);
    }

    public BigDecimal getTotalBalance(UUID userId) {
        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpenses = BigDecimal.ZERO;

        List<Transaction> allTransactions = transactionRepository.findAll();
        for (Transaction t : allTransactions) {
            if (t.getUser().getId().equals(userId)) {
                if ("income".equals(t.getType())) {
                    totalIncome = totalIncome.add(t.getAmount());
                } else if ("expense".equals(t.getType())) {
                    totalExpenses = totalExpenses.add(t.getAmount());
                }
            }
        }

        return totalIncome.subtract(totalExpenses);
    }

    public void deleteTransaction(UUID transactionId) {
        transactionRepository.deleteById(transactionId);
    }

    private String getCurrentMonthYear() {
        return YearMonth.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
    }
}