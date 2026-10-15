package com.paytrack.paytrack.service;

import com.paytrack.paytrack.entity.PaymentIssue;
import com.paytrack.paytrack.repository.PaymentIssueRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PaymentIssueService {

    private final PaymentIssueRepository repository;

    public PaymentIssueService(PaymentIssueRepository repository) {
        this.repository = repository;
    }

    public List<PaymentIssue> getAllIssues() {
        return repository.findAll();
    }

    public Optional<PaymentIssue> getIssueById(Long id) {
        return repository.findById(id);
    }

    public PaymentIssue createIssue(PaymentIssue issue) {
        return repository.save(issue);
    }

    public void deleteIssue(Long id) {
        repository.deleteById(id);
    }
    
    public Optional<PaymentIssue> updateIssue(Long id, PaymentIssue updatedIssue) {
        return repository.findById(id).map(existingIssue -> {
            existingIssue.setTransactionReference(
                    updatedIssue.getTransactionReference());
            existingIssue.setMerchantName(updatedIssue.getMerchantName());
            existingIssue.setDescription(updatedIssue.getDescription());
            existingIssue.setPriority(updatedIssue.getPriority());
            existingIssue.setStatus(updatedIssue.getStatus());

            return repository.save(existingIssue);
        });
    }

}
