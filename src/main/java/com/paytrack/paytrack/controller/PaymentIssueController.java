package com.paytrack.paytrack.controller;

import com.paytrack.paytrack.entity.PaymentIssue;
import com.paytrack.paytrack.service.PaymentIssueService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
public class PaymentIssueController {

    private final PaymentIssueService service;

    public PaymentIssueController(PaymentIssueService service) {
        this.service = service;
    }

    @GetMapping
    public List<PaymentIssue> getAllIssues(Authentication authentication) {
        return service.getAllIssues(authentication.getName());
    }

    @GetMapping("/{id}")
    public PaymentIssue getIssueById(
            @PathVariable Long id,
            Authentication authentication) {
        return service.getIssueById(id, authentication.getName());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentIssue createIssue(
            @Valid @RequestBody PaymentIssue issue,
            Authentication authentication) {
        return service.createIssue(issue, authentication.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteIssue(
            @PathVariable Long id,
            Authentication authentication) {
        service.deleteIssue(id, authentication.getName());
    }

    @PutMapping("/{id}")
    public PaymentIssue updateIssue(
            @PathVariable Long id,
            @Valid @RequestBody PaymentIssue updatedIssue,
            Authentication authentication) {
        return service.updateIssue(
                id, updatedIssue, authentication.getName());
    }
}
