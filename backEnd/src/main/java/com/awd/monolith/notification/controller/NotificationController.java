package com.awd.monolith.notification.controller;

import com.awd.monolith.notification.dto.NotificationRequest;
import com.awd.monolith.notification.dto.NotificationResponse;
import com.awd.monolith.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "Notifications sent following candidatures")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @Operation(summary = "List notifications", description = "Optionally filtered by recipient email.")
    @ApiResponse(responseCode = "200", description = "List of notifications")
    public List<NotificationResponse> findAll(
            @Parameter(description = "Only notifications sent to this email") @RequestParam(required = false) String recipient) {
        return notificationService.search(recipient);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a notification by id")
    @ApiResponse(responseCode = "200", description = "Notification found")
    @ApiResponse(responseCode = "404", description = "Notification not found",
            content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    public NotificationResponse findById(@Parameter(description = "Notification id", example = "1") @PathVariable Long id) {
        return notificationService.findById(id);
    }

    @PostMapping
    @Operation(summary = "Create a notification", description = "A candidature can have only one notification.")
    @ApiResponse(responseCode = "201", description = "Notification created")
    @ApiResponse(responseCode = "400", description = "Invalid input",
            content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "404", description = "Candidature not found",
            content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "409", description = "Candidature already has a notification",
            content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    public ResponseEntity<NotificationResponse> create(@Valid @RequestBody NotificationRequest request) {
        NotificationResponse created = notificationService.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a notification")
    @ApiResponse(responseCode = "200", description = "Notification updated")
    @ApiResponse(responseCode = "400", description = "Invalid input",
            content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "404", description = "Notification or candidature not found",
            content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "409", description = "Candidature already has a notification",
            content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    public NotificationResponse update(@Parameter(description = "Notification id", example = "1") @PathVariable Long id,
                                       @Valid @RequestBody NotificationRequest request) {
        return notificationService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a notification")
    @ApiResponse(responseCode = "204", description = "Notification deleted")
    @ApiResponse(responseCode = "404", description = "Notification not found",
            content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    public ResponseEntity<Void> delete(@Parameter(description = "Notification id", example = "1") @PathVariable Long id) {
        notificationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
