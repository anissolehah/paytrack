package com.paytrack.paytrack.controller;

import com.paytrack.paytrack.entity.PaymentIssue;
import com.paytrack.paytrack.service.PaymentIssueService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
@CrossOrigin(origins = "*")
public class PaymentIssueController {

    private final PaymentIssueService service;

    public PaymentIssueController(PaymentIssueService service) {
        this.service = service;
    }

    @GetMapping
    public List<PaymentIssue> getAllIssues() {
        return service.getAllIssues();
    }

    @GetMapping("/{id}")
    public PaymentIssue getIssueById(@PathVariable Long id) {
        return service.getIssueById(id)
                .orElseThrow(() -> new RuntimeException("Issue not found"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentIssue createIssue(
            @Valid @RequestBody PaymentIssue issue) {
        return service.createIssue(issue);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteIssue(@PathVariable Long id) {
        service.deleteIssue(id);
    }

    @PutMapping("/{id}")
    public PaymentIssue updateIssue(
            @PathVariable Long id,
            @Valid @RequestBody PaymentIssue issue) {

        return service.updateIssue(id, issue)
                .orElseThrow(() -> new RuntimeException("Issue not found"));
    }
}
