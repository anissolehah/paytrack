package com.paytrack.paytrack.service;

import com.paytrack.paytrack.entity.PaymentIssue;
import com.paytrack.paytrack.entity.User;
import com.paytrack.paytrack.repository.PaymentIssueRepository;
import com.paytrack.paytrack.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PaymentIssueService {

    private final PaymentIssueRepository issueRepository;
    private final UserRepository userRepository;

    public PaymentIssueService(
            PaymentIssueRepository issueRepository,
            UserRepository userRepository) {
        this.issueRepository = issueRepository;
        this.userRepository = userRepository;
    }

    public List<PaymentIssue> getAllIssues(String email) {
        User owner = getUserByEmail(email);
        return issueRepository.findAllByOwnerId(owner.getId());
    }

    public PaymentIssue getIssueById(Long id, String email) {
        User owner = getUserByEmail(email);

        return issueRepository.findByIdAndOwnerId(id, owner.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Issue not found."));
    }

    public PaymentIssue createIssue(PaymentIssue issue, String email) {
        User owner = getUserByEmail(email);
        issue.setOwner(owner);
        return issueRepository.save(issue);
    }

    @Transactional
    public void deleteIssue(Long id, String email) {
        PaymentIssue issue = getIssueById(id, email);
        issueRepository.delete(issue);
    }

    public PaymentIssue updateIssue(
            Long id, PaymentIssue updatedIssue, String email) {
        PaymentIssue issue = getIssueById(id, email);

        issue.setTransactionReference(
                updatedIssue.getTransactionReference());
        issue.setMerchantName(updatedIssue.getMerchantName());
        issue.setDescription(updatedIssue.getDescription());
        issue.setPriority(updatedIssue.getPriority());
        issue.setStatus(updatedIssue.getStatus());

        return issueRepository.save(issue);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found."));
    }
}
